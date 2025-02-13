import { TZDate } from "@date-fns/tz"
import { db } from "@db/client"
import { leaderboardsTable } from "@db/schema"
import { postWorkouts, postLeaderboard } from "@lib/leaderboards"
import { PelotonAPI } from "@lib/peloton"
import { RideInfo } from "@types"
import { addDays, format, subDays } from "date-fns"
import { sql } from "drizzle-orm"

async function getAndPostWorkouts(): Promise<void> {
  // Get target date from command line args if provided, otherwise use yesterday
  const serverTimezone =
    process.env.NODE_ENV === "production" ? "UTC" : "America/Chicago"

  const dateStr =
    process.argv[2] ??
    format(subDays(new TZDate(new Date(), serverTimezone), 1), "yyyy-MM-dd")

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    console.error("Date must be in YYYY-MM-DD format")
    process.exit(1)
  }

  const api = new PelotonAPI()

  const nlUserId = "efc2317a6aad48218488a27bf8b0e460"
  await postWorkouts(api, nlUserId)

  const leaderboardUserId =
    process.env["LEADERBOARD_USER_ID"] ?? "efc2317a6aad48218488a27bf8b0e460"
  await postLeaderboard(api, leaderboardUserId, true, dateStr)
  process.exit(0)
}

async function getAllPastLeaderboards(): Promise<void> {
  const api = new PelotonAPI()

  // Publish date of the supercut
  let dateStr = "2023-09-21"
  let leaderboardUserId =
    process.env["LEADERBOARD_USER_ID"] ?? "efc2317a6aad48218488a27bf8b0e460"
  const endDate = new TZDate("2025-01-30", "UTC")
  let date = new TZDate(dateStr, "UTC")
  console.info(
    `Getting leaderboards from ${dateStr} to ${format(endDate, "yyyy-MM-dd")}`,
  )

  // NL stopped posting stacks on 2023-12-30, dillwillhill took over until 2024-06-27
  if (
    date < new TZDate("2023-12-31", "UTC") ||
    date > new TZDate("2024-06-27", "UTC")
  ) {
    // NL's ID
    leaderboardUserId = "efc2317a6aad48218488a27bf8b0e460"
  } else {
    // Dillwillhill's ID
    leaderboardUserId = "9d18f22c927743dfb18ee5a4f91af63f"
  }

  // Get all leaderboards from that date until now
  while (new TZDate(dateStr, "UTC").getTime() < endDate.getTime()) {
    await postLeaderboard(api, leaderboardUserId, false, dateStr)
    console.info(`Posted leaderboard for ${dateStr}`)
    date = addDays(date, 1)
    dateStr = format(date, "yyyy-MM-dd")
  }
  console.info("Done")
  process.exit(0)
}

async function reprocessEmptyLeaderboards(): Promise<void> {
  const api = new PelotonAPI()
  const nlUserId =
    process.env["LEADERBOARD_USER_ID"] ?? "efc2317a6aad48218488a27bf8b0e460"
  const cutoffDate = "2024-05-18"

  // Get all leaderboards from the database after the cutoff date
  const leaderboards = await db
    .select()
    .from(leaderboardsTable)
    .where(sql`date > ${cutoffDate}`)
    .orderBy(sql`date`)

  const datesToReprocess = new Set<string>()

  // Look through each leaderboard for empty ride lists
  for (const leaderboard of leaderboards) {
    const json = leaderboard.json as { rides: Record<string, RideInfo> }
    if (Object.keys(json.rides).length === 0) {
      datesToReprocess.add(leaderboard.date)
    }
  }
  console.info(`Found ${datesToReprocess.size} empty leaderboards`)
  console.info(Array.from(datesToReprocess).join(", "))

  // Reprocess each date that had no rides
  for (const date of datesToReprocess) {
    console.info(`Reprocessing leaderboard for ${date}`)
    await postLeaderboard(api, nlUserId, false, date)
  }

  console.info("Done reprocessing leaderboards")
  process.exit(0)
}

// await getAllPastLeaderboards()
// await reprocessEmptyLeaderboards()
await getAndPostWorkouts()

import { TZDate } from "@date-fns/tz"
import { postLeaderboard, postWorkouts } from "@lib/leaderboards"
import { PelotonAPI } from "@lib/peloton"
import { isCronTimeValid } from "@lib/utils"
import { format, subDays } from "date-fns"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const maxDuration = 300

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (authHeader !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Cron runs at 9 AM PST and PDT
  if (!isCronTimeValid(9)) {
    return NextResponse.json(
      { error: "Current time is not 9 AM PT" },
      { status: 400 },
    )
  }

  try {
    const api = new PelotonAPI()
    const nlUserId = "efc2317a6aad48218488a27bf8b0e460"

    // Post workouts first
    await postWorkouts(api, nlUserId)

    // Get yesterday's date for the leaderboard
    const now = new TZDate(new Date(), "UTC") // Vercel servers are in UTC
    const yesterday = subDays(now, 1)
    const dateStr = format(yesterday, "yyyy-MM-dd")

    // Post leaderboard with the leaderboard user ID
    const leaderboardUserId = process.env["LEADERBOARD_USER_ID"] ?? nlUserId
    await postLeaderboard(api, leaderboardUserId, true, dateStr)

    // Revalidate necessary paths
    revalidatePath(`/archive/${dateStr}`)
    revalidatePath("/latest")
    revalidatePath("/cyclists")
    revalidatePath("/cyclist/*")

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in leaderboards cron:", error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

import { db } from "@db/client"
import { scenicRidesTable } from "@db/schema"
import { PelotonAPI } from "@lib/peloton"
import { sendDiscordRequest } from "@lib/utils"
import { format } from "date-fns"
import { eq, inArray, sql } from "drizzle-orm"

export async function processAndPostNextRide(shouldPost = true): Promise<void> {
  const api = new PelotonAPI()

  // Get all scenic rides from the database
  const dbRides = await db
    .select({
      id: scenicRidesTable.id,
      title: scenicRidesTable.title,
      location: scenicRidesTable.location,
      published_date: scenicRidesTable.published_date,
      last_posted_at: scenicRidesTable.last_posted_at,
    })
    .from(scenicRidesTable)
    .orderBy(sql`last_posted_at NULLS FIRST`)

  // Get all scenic rides from Peloton's API
  const pelotonRides = await api.getArchivedRides(
    100,
    0,
    5400,
    "virtual_active",
  )
  const apiRides = pelotonRides.data
    // Filter out Olympic Valley because it has video buffering issues
    .filter(
      (ride) =>
        !(
          ride.title === "90 min Olympic Valley Ride" &&
          format(new Date(ride.original_air_time * 1000), "yyyy-MM-dd") ===
            "2022-09-28"
        ),
    )
    .map((ride) => ({
      title: ride.title,
      location: ride.location,
      published_date: format(
        new Date(ride.original_air_time * 1000),
        "yyyy-MM-dd",
      ),
    }))

  // Find rides that are in DB but not in API (removed rides)
  const removedRides = dbRides.filter(
    (dbRide) =>
      !apiRides.some(
        (apiRide) =>
          apiRide.title === dbRide.title &&
          apiRide.published_date === dbRide.published_date,
      ),
  )

  // Find rides that are in API but not in DB (new rides)
  const newRides = apiRides.filter(
    (apiRide) =>
      !dbRides.some(
        (dbRide) =>
          apiRide.title === dbRide.title &&
          apiRide.published_date === dbRide.published_date,
      ),
  )

  // Delete removed rides using their IDs
  if (removedRides.length > 0) {
    await db.delete(scenicRidesTable).where(
      inArray(
        scenicRidesTable.id,
        removedRides.map((ride) => ride.id),
      ),
    )
  }

  // Add new rides
  if (newRides.length > 0) {
    await db.insert(scenicRidesTable).values(
      newRides.map((ride) => ({
        title: ride.title,
        location: ride.location,
        published_date: ride.published_date,
        last_posted_at: null,
      })),
    )
  }

  // Find the next ride to post - prioritize rides that haven't been posted yet,
  // then pick the one that was posted longest ago
  const [nextRide] = await db
    .select({
      id: scenicRidesTable.id,
      title: scenicRidesTable.title,
      location: scenicRidesTable.location,
      published_date: scenicRidesTable.published_date,
    })
    .from(scenicRidesTable)
    .orderBy(sql`last_posted_at NULLS FIRST`)
    .limit(1)

  if (nextRide && shouldPost) {
    // Post the ride to Discord
    const jsonBody = {
      content:
        "## Tomorrow's Ride:\n" +
        `# ${nextRide.title}\n` +
        "-# Lionbot always checks for new or removed scenic rides and updates the schedule accordingly\n" +
        "-# If there are any issues, defer to #peloton",
      allowed_mentions: {
        parse: ["roles"],
      },
    }

    const channelId = process.env["PELOTON_CHANNEL_ID"]

    await sendDiscordRequest("post", `channels/${channelId}/messages`, jsonBody)
    console.info(`Successfully posted tomorrow's ride: ${nextRide.title}`)

    await db
      .update(scenicRidesTable)
      .set({
        last_posted_at: sql`(CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')::date`,
      })
      .where(eq(scenicRidesTable.id, nextRide.id))
  }
}

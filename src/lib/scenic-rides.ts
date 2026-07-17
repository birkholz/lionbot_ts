import { format } from "date-fns"
import { eq, inArray, sql } from "drizzle-orm"

import { db } from "@db/client"
import { scenicRidesTable } from "@db/schema"
import { PelotonAPI } from "@lib/peloton"
import { sendDiscordRequest } from "@lib/utils"

export interface ScenicRideSchedule {
  title: string
  location: string
  published_date: string
  last_posted_at: string | null
  image_url: string | null
}

export async function getScenicRideSchedule(): Promise<ScenicRideSchedule[]> {
  return db
    .select({
      title: scenicRidesTable.title,
      location: scenicRidesTable.location,
      published_date: scenicRidesTable.published_date,
      last_posted_at: scenicRidesTable.last_posted_at,
      image_url: scenicRidesTable.image_url,
    })
    .from(scenicRidesTable)
    .orderBy(sql`last_posted_at NULLS FIRST`)
}

interface ApiScenicRide {
  title: string
  location: string
  published_date: string
  image_url: string
}

async function fetchApiScenicRides(api: PelotonAPI): Promise<ApiScenicRide[]> {
  const pelotonRides = await api.getArchivedRides(
    100,
    0,
    5400,
    "virtual_active",
  )
  return (
    pelotonRides.data
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
        image_url: ride.image_url,
      }))
  )
}

// Refreshes image_url for existing rides whose thumbnail is missing or stale. Returns the number updated.
async function reconcileImageUrls(
  dbRides: {
    id: number
    title: string
    published_date: string
    image_url: string | null
  }[],
  apiRides: ApiScenicRide[],
): Promise<number> {
  const updates: { id: number; image_url: string }[] = []
  for (const dbRide of dbRides) {
    const apiRide = apiRides.find(
      (apiRide) =>
        apiRide.title === dbRide.title &&
        apiRide.published_date === dbRide.published_date,
    )
    if (
      apiRide != null &&
      apiRide.image_url !== "" &&
      apiRide.image_url !== dbRide.image_url
    ) {
      updates.push({ id: dbRide.id, image_url: apiRide.image_url })
    }
  }

  if (updates.length === 0) return 0

  await db
    .update(scenicRidesTable)
    .set({
      image_url: sql`(CASE ${scenicRidesTable.id} ${sql.join(
        updates.map(
          (update) => sql`WHEN ${update.id} THEN ${update.image_url}`,
        ),
        sql` `,
      )} END)`,
    })
    .where(
      inArray(
        scenicRidesTable.id,
        updates.map((update) => update.id),
      ),
    )

  return updates.length
}

export async function backfillScenicRideImages(): Promise<number> {
  const api = new PelotonAPI()

  const [dbRides, apiRides] = await Promise.all([
    db
      .select({
        id: scenicRidesTable.id,
        title: scenicRidesTable.title,
        published_date: scenicRidesTable.published_date,
        image_url: scenicRidesTable.image_url,
      })
      .from(scenicRidesTable),
    fetchApiScenicRides(api),
  ])

  return reconcileImageUrls(dbRides, apiRides)
}

export async function processAndPostNextRide(shouldPost = true): Promise<void> {
  const api = new PelotonAPI()

  // Get all scenic rides from the database and from Peloton's API concurrently
  const [dbRides, apiRides] = await Promise.all([
    db
      .select({
        id: scenicRidesTable.id,
        title: scenicRidesTable.title,
        location: scenicRidesTable.location,
        published_date: scenicRidesTable.published_date,
        last_posted_at: scenicRidesTable.last_posted_at,
        image_url: scenicRidesTable.image_url,
      })
      .from(scenicRidesTable)
      .orderBy(sql`last_posted_at NULLS FIRST`),
    fetchApiScenicRides(api),
  ])

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
        image_url: ride.image_url,
      })),
    )
  }

  // Refresh thumbnails for existing rides whose image_url is missing or stale.
  // A failure here shouldn't block picking/posting the next ride.
  try {
    await reconcileImageUrls(dbRides, apiRides)
  } catch (error) {
    console.error("Error reconciling scenic ride thumbnails:", error)
  }

  // Find the next ride to post - prioritize rides that haven't been posted yet,
  // then pick the one that was posted longest ago
  const nextRideRows = await db
    .select({
      id: scenicRidesTable.id,
      title: scenicRidesTable.title,
      location: scenicRidesTable.location,
      published_date: scenicRidesTable.published_date,
    })
    .from(scenicRidesTable)
    .orderBy(sql`last_posted_at NULLS FIRST`)
    .limit(1)
  const nextRide: (typeof nextRideRows)[number] | undefined = nextRideRows[0]

  if (nextRide != null && shouldPost) {
    // Post the ride to Discord
    const jsonBody = {
      content:
        "## Tomorrow's Ride:\n" +
        `# ${nextRide.title}\n` +
        "-# Lionbot always checks for new or removed scenic rides and updates the schedule accordingly\n" +
        "-# See the [ride schedule](https://www.theeggcarton.bike/schedule) for past rides\n" +
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
        last_posted_at: sql`(CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')::date`,
      })
      .where(eq(scenicRidesTable.id, nextRide.id))
  }
}

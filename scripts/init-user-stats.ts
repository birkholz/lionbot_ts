import { db } from "@db/client"
import { leaderboardsTable, cyclistsTable } from "@db/schema"
import { sql } from "drizzle-orm"
import type { LeaderboardJson } from "@types"

async function initUserStats() {
  console.log("Fetching all leaderboards...")
  const leaderboards = await db
    .select({
      date: leaderboardsTable.date,
      json: leaderboardsTable.json,
    })
    .from(leaderboardsTable)
    .orderBy(leaderboardsTable.date)

  console.log(`Found ${leaderboards.length} leaderboards`)

  // Get all valid cyclists from the database
  const validCyclists = await db
    .select({
      username: cyclistsTable.username,
      user_id: cyclistsTable.user_id,
    })
    .from(cyclistsTable)

  // Create lookup maps for both username and user_id
  const cyclistByUsername = new Map(validCyclists.map((c) => [c.username, c]))
  const cyclistById = new Map(validCyclists.map((c) => [c.user_id, c]))
  console.log(`Found ${validCyclists.length} valid cyclists in database`)

  // Track user stats as we process leaderboards
  const userStats = new Map<
    string, // user_id
    {
      first_ride: string
      total_rides: number
      highest_output: number
    }
  >()

  // Process each leaderboard
  for (const leaderboard of leaderboards) {
    const json = leaderboard.json as LeaderboardJson
    const rides = json.rides
    const playersWhoPbd = json.playersWhoPbd || {}

    // Process each ride's workouts to count participation
    for (const ride of Object.values(rides)) {
      if (ride.id === "00000000000000000000000000000000") continue
      for (const workout of ride.workouts) {
        // Handle both username and user_id based data structures
        const cyclist =
          cyclistById.get(workout.user_id) ||
          cyclistByUsername.get(workout.user_username)
        if (!cyclist) continue

        const existingStats = userStats.get(cyclist.user_id)

        if (!existingStats) {
          userStats.set(cyclist.user_id, {
            first_ride: leaderboard.date,
            total_rides: 1,
            highest_output: 0, // Will be updated from PBs
          })
        } else {
          existingStats.total_rides += 1
        }
      }
    }

    // Update highest outputs from PBs
    for (const [key, pbs] of Object.entries(playersWhoPbd)) {
      // Handle both username and user_id based data structures
      const cyclist = cyclistById.get(key) || cyclistByUsername.get(key)
      if (!cyclist) continue
      const stats = userStats.get(cyclist.user_id)
      if (!stats) continue

      // Find the highest output in this user's PBs
      const highestPbOutput = Math.max(...pbs.map((pb) => pb.total_work))
      stats.highest_output = Math.max(stats.highest_output, highestPbOutput)
    }
  }

  console.log(`Found ${userStats.size} unique users with valid stats`)

  // Insert all user stats
  console.log("Inserting user stats...")
  for (const [user_id, stats] of userStats.entries()) {
    await db
      .update(cyclistsTable)
      .set({
        first_ride: sql`COALESCE(${cyclistsTable.first_ride}, ${sql.param(stats.first_ride)})`,
        total_rides: stats.total_rides,
        highest_output: Math.round(stats.highest_output),
      })
      .where(sql`${cyclistsTable.user_id} = ${user_id}`)
  }

  console.log("Done!")
  process.exit(0)
}

await initUserStats()

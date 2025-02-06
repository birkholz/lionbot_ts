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

  // Track user stats as we process leaderboards
  const userStats = new Map<
    string,
    { first_ride: string; total_rides: number; highest_output: number }
  >()

  // Process each leaderboard
  for (const leaderboard of leaderboards) {
    const json = leaderboard.json as LeaderboardJson
    const rides = json.rides
    const playersWhoPbd = json.playersWhoPbd || {}

    // Process each ride's workouts to count participation
    for (const ride of Object.values(rides)) {
      for (const workout of ride.workouts) {
        const username = workout.user_username
        const existingStats = userStats.get(username)

        if (!existingStats) {
          userStats.set(username, {
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
    for (const [username, pbs] of Object.entries(playersWhoPbd)) {
      const stats = userStats.get(username)
      if (!stats) continue

      // Find the highest output in this user's PBs
      const highestPbOutput = Math.max(...pbs.map((pb) => pb.total_work))
      stats.highest_output = Math.max(stats.highest_output, highestPbOutput)
    }
  }

  console.log(`Found ${userStats.size} unique users`)

  // Insert all user stats
  console.log("Inserting user stats...")
  for (const [username, stats] of userStats) {
    await db
      .insert(cyclistsTable)
      .values({
        username,
        user_id: "", // Will be filled by fetch-avatars.ts
        avatar_url: "", // Will be filled by fetch-avatars.ts
        first_ride: stats.first_ride,
        total_rides: stats.total_rides,
        highest_output: Math.round(stats.highest_output),
      })
      .onConflictDoUpdate({
        target: cyclistsTable.username,
        set: {
          first_ride: sql`COALESCE(${cyclistsTable.first_ride}, ${sql.param(stats.first_ride)})`,
          total_rides: stats.total_rides,
          highest_output: Math.round(stats.highest_output),
        },
      })
  }

  console.log("Done!")
  process.exit(0)
}

await initUserStats()

import { db } from "@db/client"
import { leaderboardsTable } from "@db/schema"
import type { LeaderboardJson, EffortZones } from "@types"
import { format } from "date-fns"
import { asc, desc, eq } from "drizzle-orm"
import { PelotonAPI } from "@lib/peloton"

export interface Leaderboard {
  date: string
  json: LeaderboardJson
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface UserStats {
  username: string
  firstRide: string
  totalRides: number
  highestPbRate?: number
  highestOutput?: number
  avatar_url?: string
}

export interface UserRide {
  date: string
  id: string
  title: string
  instructor_name: string
  total_work: number
  is_new_pb: boolean
  effort_zones: EffortZones | null
}

export async function getLeaderboardDateRange(): Promise<DateRange> {
  const [firstLeaderboard] = await db
    .select({ date: leaderboardsTable.date })
    .from(leaderboardsTable)
    .orderBy(asc(leaderboardsTable.date))
    .limit(1)

  const [lastLeaderboard] = await db
    .select({ date: leaderboardsTable.date })
    .from(leaderboardsTable)
    .orderBy(desc(leaderboardsTable.date))
    .limit(1)

  const today = format(new Date(), "yyyy-MM-dd")
  return {
    startDate: firstLeaderboard?.date ?? today,
    endDate: lastLeaderboard?.date ?? today,
  }
}

export async function getLatestLeaderboard(): Promise<Leaderboard | null> {
  const [leaderboard] = await db
    .select()
    .from(leaderboardsTable)
    .orderBy(desc(leaderboardsTable.date))
    .limit(1)
  return leaderboard
    ? { date: leaderboard.date, json: leaderboard.json as LeaderboardJson }
    : null
}

export async function getLeaderboardByDate(
  date: string,
): Promise<Leaderboard | null> {
  const [leaderboard] = await db
    .select()
    .from(leaderboardsTable)
    .where(eq(leaderboardsTable.date, date))
    .limit(1)
  return leaderboard
    ? { date: leaderboard.date, json: leaderboard.json as LeaderboardJson }
    : null
}

export async function getUserStats(): Promise<UserStats[]> {
  // Get all leaderboards ordered by date ascending to get accurate first ride dates
  const leaderboards = await db
    .select()
    .from(leaderboardsTable)
    .orderBy(asc(leaderboardsTable.date))

  const userStats = new Map<string, UserStats>()

  // Process each leaderboard to gather user stats
  for (const leaderboard of leaderboards) {
    const data = leaderboard.json as LeaderboardJson

    // Process workouts for first ride and total rides
    for (const ride of Object.values(data.rides)) {
      for (const workout of ride.workouts) {
        const username = workout.user_username

        if (!userStats.has(username)) {
          userStats.set(username, {
            username,
            firstRide: leaderboard.date,
            totalRides: 1,
          })
        } else {
          const stats = userStats.get(username)!
          stats.totalRides += 1
        }
      }
    }

    // Process PBs for highest output rate and total output
    for (const [username, pbs] of Object.entries(data.playersWhoPbd)) {
      const stats = userStats.get(username)
      if (stats) {
        for (const pb of pbs) {
          // Update highest output if this is higher
          if (!stats.highestOutput || pb.total_work > stats.highestOutput) {
            stats.highestOutput = pb.total_work
          }

          // Update highest rate if this is higher
          const rate = pb.total_work / pb.duration
          if (!stats.highestPbRate || rate > stats.highestPbRate) {
            stats.highestPbRate = rate
          }
        }
      }
    }
  }

  return Array.from(userStats.values()).sort(
    (a, b) => b.totalRides - a.totalRides,
  )
}

export async function getUserStatsWithAvatars(): Promise<UserStats[]> {
  const stats = await getUserStats()

  if (process.env.NODE_ENV === "development") {
    // In development, use placeholder images for faster loading
    return stats.map((user) => ({
      ...user,
      avatar_url: `https://placehold.co/21x21/red/red.webp`,
    }))
  }

  // In production, fetch real avatars from Peloton
  const peloton = new PelotonAPI()
  await peloton.login()
  const { users: tagUsers } = await peloton.getUsersInTag("TheEggCarton")

  // Create a map of username to avatar URL for quick lookups
  const avatarMap = new Map(
    tagUsers.map((user) => [user.username, user.avatar_url]),
  )

  // Add avatar URLs to the stats
  return stats.map((user) => ({
    ...user,
    avatar_url: avatarMap.get(user.username),
  }))
}

export async function getUserRides(username: string): Promise<UserRide[]> {
  const leaderboards = await db
    .select()
    .from(leaderboardsTable)
    .orderBy(desc(leaderboardsTable.date))

  const rides: UserRide[] = []

  for (const leaderboard of leaderboards) {
    const data = leaderboard.json as LeaderboardJson

    for (const ride of Object.values(data.rides)) {
      const workout = ride.workouts.find((w) => w.user_username === username)
      if (workout) {
        rides.push({
          date: leaderboard.date,
          id: ride.id,
          title: ride.title,
          instructor_name: ride.instructor_name,
          total_work: workout.total_work,
          is_new_pb: workout.is_new_pb,
          effort_zones: workout.effort_zones,
        })
      }
    }
  }

  return rides
}

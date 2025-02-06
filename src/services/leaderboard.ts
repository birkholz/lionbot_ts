"use server"

import { db } from "@db/client"
import { leaderboardsTable, userAvatarsTable } from "@db/schema"
import type { EffortZones, LeaderboardJson } from "@types"
import { format } from "date-fns"
import { asc, desc, eq, sql } from "drizzle-orm"
import { unstable_cache } from "next/cache"

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

const getCachedDateRange = unstable_cache(
  async () => {
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
  },
  ["date-range"],
  {
    revalidate: 60 * 60, // Cache for 1 hour
    tags: ["date-range"],
  },
)

export async function getLeaderboardDateRange(): Promise<DateRange> {
  return getCachedDateRange()
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

const getCachedUserStats = unstable_cache(
  async () => {
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

    // Return all users sorted by total rides
    return Array.from(userStats.values()).sort(
      (a, b) => b.totalRides - a.totalRides,
    )
  },
  ["user-stats"],
  {
    revalidate: 60 * 60, // Cache for 1 hour
    tags: ["user-stats"],
  },
)

export async function getUserStats(): Promise<UserStats[]> {
  return getCachedUserStats()
}

const getCachedUserAvatars = unstable_cache(
  async () => {
    const avatars = await db
      .select({
        username: userAvatarsTable.username,
        user_id: userAvatarsTable.user_id,
        avatar_url: userAvatarsTable.avatar_url,
      })
      .from(userAvatarsTable)

    return avatars
  },
  ["user-avatars"],
  {
    revalidate: 60 * 60, // Cache for 1 hour
    tags: ["user-avatars"],
  },
)

export async function getUserAvatars(): Promise<
  Array<{ username: string; user_id: string; avatar_url: string }>
> {
  return getCachedUserAvatars()
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

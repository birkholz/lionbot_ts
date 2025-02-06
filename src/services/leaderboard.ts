"use server"

import { db } from "@db/client"
import { leaderboardsTable } from "@db/schema"
import type { EffortZones, LeaderboardJson } from "@types"
import { format } from "date-fns"
import { asc, desc, eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
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
  // Cache the user stats with fetch
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/stats`,
    {
      cache: "force-cache",
    },
  )

  if (!response.ok) {
    console.error("Failed to fetch user stats:", response.status)
    return []
  }

  return response.json()
}

// Move the actual stats computation to an API route
export async function computeUserStats(): Promise<UserStats[]> {
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

const getCachedPelotonUsers = unstable_cache(
  async (cursor?: string) => {
    try {
      const api = new PelotonAPI()
      return await api.getUsersInTag("TheEggCarton", cursor)
    } catch (error) {
      console.error("Failed to fetch Peloton users:", error)
      return null
    }
  },
  ["peloton-users"],
  {
    revalidate: 60 * 60 * 24, // Cache for 24 hours
    tags: ["peloton-users"],
  },
)

export async function getUserAvatars(): Promise<
  Array<{ username: string; avatar_url: string }>
> {
  if (process.env.NODE_ENV === "development") {
    // In development, use placeholder images for faster loading
    return []
  }

  const allUsers: Array<{ username: string; avatar_url: string }> = []
  let hasNextPage = true
  let cursor: string | undefined = undefined

  while (hasNextPage) {
    const result = await getCachedPelotonUsers(cursor)

    if (!result) {
      return allUsers
    }

    allUsers.push(...result.users)
    hasNextPage = result.hasNextPage
    cursor = result.endCursor ?? undefined
  }

  return allUsers
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

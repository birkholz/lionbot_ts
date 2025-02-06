"use server"

import { db } from "@db/client"
import { leaderboardsTable, cyclistsTable } from "@db/schema"
import type { EffortZones, LeaderboardJson } from "@types"
import { format } from "date-fns"
import { asc, desc, eq, isNotNull, sql } from "drizzle-orm"
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
    const result = await db
      .select({
        username: cyclistsTable.username,
        first_ride: cyclistsTable.first_ride,
        total_rides: cyclistsTable.total_rides,
        highest_output: cyclistsTable.highest_output,
        avatar_url: cyclistsTable.avatar_url,
      })
      .from(cyclistsTable)
      .where(isNotNull(cyclistsTable.first_ride))
      .orderBy(desc(cyclistsTable.total_rides))

    return result.map((row) => ({
      username: row.username,
      firstRide: row.first_ride ? format(row.first_ride, "yyyy-MM-dd") : "",
      totalRides: row.total_rides ?? 0,
      highestOutput: row.highest_output ?? undefined,
      avatar_url: row.avatar_url,
    }))
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
        username: cyclistsTable.username,
        user_id: cyclistsTable.user_id,
        avatar_url: cyclistsTable.avatar_url,
      })
      .from(cyclistsTable)

    return avatars
  },
  ["user-avatars"],
  {
    revalidate: 60 * 60, // Cache for 1 hour
    tags: ["user-avatars"],
  },
)

export async function getCyclist(username: string): Promise<
  | {
      username: string
      user_id: string
      avatar_url: string
      first_ride: string | null
      total_rides: number | null
      highest_output: number | null
    }
  | undefined
> {
  const [avatar] = await db
    .select({
      username: cyclistsTable.username,
      user_id: cyclistsTable.user_id,
      avatar_url: cyclistsTable.avatar_url,
      first_ride: cyclistsTable.first_ride,
      total_rides: cyclistsTable.total_rides,
      highest_output: cyclistsTable.highest_output,
    })
    .from(cyclistsTable)
    .where(eq(cyclistsTable.username, username))
    .limit(1)

  return avatar
}

export async function getUserAvatars(): Promise<
  Array<{ username: string; user_id: string; avatar_url: string }>
> {
  return getCachedUserAvatars()
}

export async function getUserRides(username: string): Promise<UserRide[]> {
  const rides = await db
    .select({
      date: leaderboardsTable.date,
      ride_data: sql<string>`
        jsonb_build_object(
          'id', ride.value->>'id',
          'title', ride.value->>'title',
          'instructor_name', ride.value->>'instructor_name'
        )::text
      `,
    })
    .from(leaderboardsTable)
    .leftJoin(
      sql`jsonb_each(${leaderboardsTable.json}->'rides') AS ride`,
      sql`true`,
    )
    .where(
      sql`
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(ride.value->'workouts') workout
        WHERE workout->>'user_username' = ${sql.param(username)}
      )
    `,
    )
    .orderBy(desc(leaderboardsTable.date))

  return rides.map((ride) => {
    const data = JSON.parse(ride.ride_data)
    return {
      date: ride.date,
      id: data.id,
      title: data.title,
      instructor_name: data.instructor_name,
    }
  })
}

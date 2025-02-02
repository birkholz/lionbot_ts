import { db } from "@db/client"
import { leaderboardsTable } from "@db/schema"
import type { LeaderboardJson } from "@types"
import { format } from "date-fns"
import { asc, desc, eq } from "drizzle-orm"

export interface Leaderboard {
  date: string
  json: LeaderboardJson
}

export interface DateRange {
  startDate: string
  endDate: string
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

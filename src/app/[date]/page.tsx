import { DateNavigation } from "@components/date-navigation"
import { LeaderboardDisplay } from "@components/leaderboard-display"
import { db } from "@db/client"
import { leaderboardsTable } from "@db/schema"
import { parseDate } from "@lib/utils"
import type { LeaderboardJson } from "@types"
import { format } from "date-fns"
import { asc, desc, eq } from "drizzle-orm"
import { mean, median } from "mathjs"

export default async function Page({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  const displayDate = parseDate(date)

  // Get the date range from the database
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

  const startDate = parseDate(
    firstLeaderboard?.date ?? format(new Date(), "yyyy-MM-dd"),
  )
  const endDate = parseDate(
    lastLeaderboard?.date ?? format(new Date(), "yyyy-MM-dd"),
  )

  const leaderboards = await db
    .select()
    .from(leaderboardsTable)
    .where(eq(leaderboardsTable.date, format(displayDate, "yyyy-MM-dd")))
    .orderBy(desc(leaderboardsTable.date))
    .limit(1)
  const leaderboard = leaderboards[0]

  if (!leaderboard || !leaderboard.json) {
    return (
      <article className="mx-auto mt-4 max-w-2xl rounded-xl bg-zinc-900 p-3 shadow-md">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          #TheEggCarton Leaderboards
        </h1>
        <DateNavigation
          date={displayDate}
          startDate={startDate}
          endDate={endDate}
        />
        <p className="mt-4 text-center">No leaderboard data available.</p>
      </article>
    )
  }

  const data = leaderboard.json as LeaderboardJson
  const rides = Object.entries(data.rides).map(([_, ride]) => ({
    id: ride.id,
    title: ride.title,
    instructor_name: ride.instructor_name,
    start_time: ride.start_time,
    url: ride.url,
    image_url: ride.image_url,
    workouts: ride.workouts.map((w) => ({
      user_username: w.user_username,
      total_work: w.total_work,
      is_new_pb: w.is_new_pb,
      strive_score: w.strive_score,
      avg_cadence: w.avg_cadence,
      avg_resistance: w.avg_resistance,
      distance: w.distance,
      duration: w.duration,
      effort_zones: w.effort_zones,
    })),
  }))

  const totals = data.totals
  const playersWhoPbd = data.playersWhoPbd

  const totalsList = Object.values(totals).sort((a, b) => b.output - a.output)
  const totalRiders = totalsList.length
  const rideCounts = totalsList.map((w) => w.rides)
  const medianRideCount = median(rideCounts)
  const averageRideCount = mean(rideCounts)
  const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0)
  const PBList = Object.entries(playersWhoPbd).sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
  )

  return (
    <LeaderboardDisplay
      displayDate={displayDate}
      rides={rides}
      totals={totals}
      totalsList={totalsList}
      totalRiders={totalRiders}
      medianRideCount={medianRideCount}
      averageRideCount={averageRideCount}
      totalOutput={totalOutput}
      PBList={PBList}
      startDate={startDate}
      endDate={endDate}
    />
  )
}

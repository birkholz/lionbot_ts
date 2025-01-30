import { TZDate } from "@date-fns/tz"
import { addDays, format, subDays } from "date-fns"
import { asc, desc, sql } from "drizzle-orm"
import { mean, median } from "mathjs"
import { DateNavigation } from "../../components/date-navigation"
import { LeaderboardDisplay } from "../../components/leaderboard-display"
import { db } from "../../lionbot/db/client"
import { leaderboardsTable } from "../../lionbot/db/schema"
import { UserTotal } from "../../lionbot/utils"

type RideData = {
  id: string
  title: string
  instructor_name: string
  start_time: number
  url: string
  workouts: {
    user_username: string
    total_work: number
    is_new_pb: boolean
    avg_cadence: number
    avg_resistance: number
    strive_score?: number
  }[]
}

type LeaderboardJson = {
  rides: Record<string, RideData>
  totals: Record<string, UserTotal>
  playersWhoPbd: Record<string, { total_work: number; duration: number }[]>
}

type Props = {
  params: {
    date: string
  }
}

export default async function Page({ params }: Props) {
  const { date } = await params
  const [year, month, day] = date.split("-").map(Number)
  const displayDate = new TZDate(
    year,
    month - 1,
    day,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  )

  // Get the date range from the database
  const [firstLeaderboard] = await db
    .select({ createdAt: leaderboardsTable.createdAt })
    .from(leaderboardsTable)
    .orderBy(asc(leaderboardsTable.createdAt))
    .limit(1)

  const [lastLeaderboard] = await db
    .select({ createdAt: leaderboardsTable.createdAt })
    .from(leaderboardsTable)
    .orderBy(desc(leaderboardsTable.createdAt))
    .limit(1)

  const startDate = firstLeaderboard?.createdAt ?? new Date()
  const endDate = lastLeaderboard?.createdAt ?? new Date()

  const leaderboards = await db
    .select()
    .from(leaderboardsTable)
    .where(
      // Add one day since leaderboard createdAt is one day ahead of the rides
      sql`created_at::date = ${format(addDays(displayDate, 1), "yyyy-MM-dd")}`,
    )
    .orderBy(desc(leaderboardsTable.createdAt))
    .limit(1)
  const leaderboard = leaderboards[0]

  if (!leaderboard) {
    return (
      <article className="mx-auto mt-4 max-w-2xl rounded-xl bg-zinc-900 p-3 shadow-md">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          #TheEggCarton Leaderboards
        </h1>
        <DateNavigation
          date={displayDate}
          startDate={subDays(startDate, 1)}
          endDate={subDays(endDate, 1)}
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
    workouts: ride.workouts.map((w) => ({
      user_username: w.user_username,
      total_work: w.total_work,
      is_new_pb: w.is_new_pb,
      strive_score: w.strive_score,
      avg_cadence: w.avg_cadence,
      avg_resistance: w.avg_resistance,
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
      startDate={subDays(startDate, 1)}
      endDate={subDays(endDate, 1)}
    />
  )
}

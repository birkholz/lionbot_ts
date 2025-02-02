import { Layout } from "@components/layout"
import { LeaderboardDisplay } from "@components/leaderboard-display"
import type { LeaderboardJson } from "@types"
import type { DateRange } from "../services/leaderboard"
import { mean } from "mathjs"
import { parseDate } from "@lib/utils"

interface Props {
  date: string
  leaderboard: {
    json: LeaderboardJson
  }
  dateRange: DateRange
}

export function LeaderboardPage({ date, leaderboard, dateRange }: Props) {
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
  const averageRideCount = mean(rideCounts)
  const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0)
  const PBList = Object.entries(playersWhoPbd).sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
  )

  return (
    <Layout date={date} dateRange={dateRange}>
      <LeaderboardDisplay
        displayDate={parseDate(date)}
        rides={rides}
        totals={totals}
        totalsList={totalsList}
        totalRiders={totalRiders}
        averageRideCount={averageRideCount}
        totalOutput={totalOutput}
        PBList={PBList}
      />
    </Layout>
  )
}

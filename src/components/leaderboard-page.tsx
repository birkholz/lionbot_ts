import { DateNavigation } from "@components/date-navigation"
import { LeaderboardDisplay } from "@components/leaderboard-display"
import { Separator } from "@components/ui/separator"
import { parseDate } from "@lib/utils"
import type { LeaderboardJson } from "@types"
import { mean } from "mathjs"
import type { DateRange } from "../services/leaderboard"

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

  const displayDate = parseDate(date)

  return (
    <>
      <DateNavigation
        date={displayDate}
        startDate={parseDate(dateRange.startDate)}
        endDate={parseDate(dateRange.endDate)}
      />
      <Separator className="mt-2" />
      <LeaderboardDisplay
        rides={rides}
        totals={totals}
        totalsList={totalsList}
        totalRiders={totalRiders}
        averageRideCount={averageRideCount}
        totalOutput={totalOutput}
        PBList={PBList}
      />
    </>
  )
}

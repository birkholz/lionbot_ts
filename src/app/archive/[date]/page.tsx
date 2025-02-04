import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import { TZDate } from "@date-fns/tz"
import {
  getLeaderboardByDate,
  getLeaderboardDateRange,
} from "@services/leaderboard"
import { addDays, format, isMatch, subDays } from "date-fns"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const { startDate, endDate } = await getLeaderboardDateRange()
  const dates: string[] = []
  let currentDate = new TZDate(startDate, "UTC")
  // Don't cache the last date because it's handled by /latest
  const lastDate = subDays(new TZDate(endDate, "UTC"), 1)

  while (currentDate <= lastDate) {
    dates.push(format(currentDate, "yyyy-MM-dd"))
    currentDate = addDays(currentDate, 1)
  }

  return dates.map((date) => ({
    date,
  }))
}

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  if (!isMatch(date, "yyyy-MM-dd")) {
    notFound()
  }

  const leaderboard = await getLeaderboardByDate(date)

  if (!leaderboard || !leaderboard.json) {
    return <NoLeaderboard />
  }

  const dateRange = getLeaderboardDateRange()

  return (
    <LeaderboardPage
      date={date}
      leaderboard={leaderboard}
      dateRange={dateRange}
    />
  )
}

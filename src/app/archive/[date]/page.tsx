import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import { isMatch } from "date-fns"
import { notFound } from "next/navigation"
import {
  getLeaderboardByDate,
  getLeaderboardDateRange,
} from "@services/leaderboard"

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  if (!isMatch(date, "yyyy-MM-dd")) {
    notFound()
  }

  const [leaderboard, dateRange] = await Promise.all([
    getLeaderboardByDate(date),
    getLeaderboardDateRange(),
  ])

  if (!leaderboard || !leaderboard.json) {
    return <NoLeaderboard date={date} dateRange={dateRange} />
  }

  return (
    <LeaderboardPage
      date={date}
      leaderboard={leaderboard}
      dateRange={dateRange}
    />
  )
}

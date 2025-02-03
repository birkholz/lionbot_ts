import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import {
  getLeaderboardByDate,
  getLeaderboardDateRange,
} from "@services/leaderboard"
import { isMatch } from "date-fns"
import { notFound } from "next/navigation"

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

import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import {
  getLatestLeaderboard,
  getLeaderboardDateRange,
} from "@services/leaderboard"

export default async function LatestPage() {
  const [leaderboard, dateRange] = await Promise.all([
    getLatestLeaderboard(),
    getLeaderboardDateRange(),
  ])
  const date = leaderboard?.date || new Date().toISOString().split("T")[0]

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

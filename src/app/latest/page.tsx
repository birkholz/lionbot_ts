import { DateNavigation } from "@components/date-navigation"
import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import {
  getLatestLeaderboard,
  getLeaderboardDateRange,
  getUserAvatars,
} from "@services/leaderboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "#TheEggCarton Leaderboards",
}

export default async function LatestPage() {
  const [leaderboard, avatars] = await Promise.all([
    getLatestLeaderboard(),
    getUserAvatars(),
  ])
  const date = leaderboard?.date || new Date().toISOString().split("T")[0]

  if (!leaderboard || !leaderboard.json) {
    return (
      <div className="relative">
        <DateNavigation />
        <NoLeaderboard />
      </div>
    )
  }
  const dateRange = getLeaderboardDateRange()

  return (
    <div className="relative">
      <DateNavigation />
      <LeaderboardPage
        date={date}
        leaderboard={leaderboard}
        dateRange={dateRange}
        avatars={avatars}
      />
    </div>
  )
}

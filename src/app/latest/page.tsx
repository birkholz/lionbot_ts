import { DateNavigation } from "@components/date-navigation"
import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import {
  getLatestLeaderboard,
  getLeaderboardDateRange,
} from "@services/leaderboard"
import type { Metadata } from "next"

// Force dynamic rendering, revalidation happens in the cron job
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "#TheEggCarton Leaderboards",
}

export default async function LatestPage() {
  const leaderboard = await getLatestLeaderboard()
  const date = leaderboard?.date || new Date().toISOString().split("T")[0]

  if (!leaderboard || !leaderboard.json) {
    return <NoLeaderboard />
  }
  const dateRange = getLeaderboardDateRange()

  return (
    <div className="relative">
      <DateNavigation />
      <LeaderboardPage
        date={date}
        leaderboard={leaderboard}
        dateRange={dateRange}
      />
    </div>
  )
}

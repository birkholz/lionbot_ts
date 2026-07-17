import type { Metadata } from "next"
import type React from "react"

import { DateNavigation } from "@components/date-navigation"
import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import bothImage from "/public/both.png"
import {
  getCachedUserAvatars,
  getLatestLeaderboard,
  getLeaderboardDateRange,
} from "@services/leaderboard"

export const metadata: Metadata = {
  title: "#TheEggCarton Leaderboards",
  openGraph: {
    images: [
      {
        url: bothImage.src,
      },
    ],
  },
}

export default async function LatestPage(): Promise<React.ReactElement> {
  const [leaderboard, avatars] = await Promise.all([
    getLatestLeaderboard(),
    getCachedUserAvatars(),
  ])
  const date = leaderboard?.date ?? new Date().toISOString().split("T")[0]

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
        leaderboard={{ json: leaderboard.json }}
        dateRange={dateRange}
        avatars={avatars}
      />
    </div>
  )
}

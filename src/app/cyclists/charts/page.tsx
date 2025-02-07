import { CyclistsChart } from "@components/cyclists-chart"
import { DailyParticipationChart } from "@components/daily-participation-chart"
import { WeeklyParticipationChart } from "@components/weekly-participation-chart"
import bothImage from "/public/both.png"
import { getParticipationData, getUserStats } from "@services/leaderboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "#TheEggCarton Charts",
  description: "Charts showing the group's growth and participation",
  openGraph: {
    images: [{ url: bothImage.src }],
  },
}

export default async function CyclistCharts() {
  const [userStats, participationData] = await Promise.all([
    getUserStats(),
    getParticipationData(),
  ])

  return (
    <div>
      <h1 className="mb-4 text-center text-2xl font-bold">
        Cyclist Growth & Participation
      </h1>
      <p className="mx-4 mb-6 text-sm text-muted-foreground">
        These charts only count rides for which a leaderboard was generated.
        Cyclists with the tag who have never joined a single group ride are not
        included.
      </p>
      <div className="mb-8">
        <h2 className="mb-4 text-center text-xl font-bold">
          Daily Participation (Last 2 Months)
        </h2>
        <DailyParticipationChart data={participationData} />
      </div>
      <div className="mb-8">
        <h2 className="mb-4 text-center text-xl font-bold">
          Weekly Participation
        </h2>
        <WeeklyParticipationChart data={participationData} />
      </div>
      <div className="mb-8">
        <h2 className="mb-4 text-center text-xl font-bold">
          New Cyclists Over Time
        </h2>
        <CyclistsChart users={userStats} />
      </div>
    </div>
  )
}

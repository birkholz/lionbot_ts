import { DateNavigation } from "@components/date-navigation"
import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import { TZDate } from "@date-fns/tz"
import {
  getCachedUserAvatars,
  getLeaderboardByDate,
  getLeaderboardDateRange,
} from "@services/leaderboard"
import { addDays, format, isMatch, subDays } from "date-fns"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import bothImage from "/public/both.png"

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "development") {
    return []
  }
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

interface Props {
  params: Promise<{
    date: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params
  return {
    title: `#TheEggCarton Leaderboards - ${date}`,
    openGraph: {
      images: [
        {
          url: bothImage.src,
        },
      ],
    },
  }
}

export default async function DatePage({ params }: Props) {
  const { date } = await params

  if (!isMatch(date, "yyyy-MM-dd")) {
    notFound()
  }

  const [leaderboard, avatars] = await Promise.all([
    getLeaderboardByDate(date),
    getCachedUserAvatars(),
  ])

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

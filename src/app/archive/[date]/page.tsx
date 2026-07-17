import { TZDate } from "@date-fns/tz"
import { addDays, format, isMatch, subDays } from "date-fns"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type React from "react"

import { DateNavigation } from "@components/date-navigation"
import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import {
  getCachedUserAvatars,
  getLeaderboardByDate,
  getLeaderboardDateRange,
} from "@services/leaderboard"

import bothImage from "/public/both.png"

// Older dates never change once posted, so only pre-render a recent window
// at build time; everything older is generated on first request and cached
// indefinitely via ISR (see `dynamicParams` below) instead of being rebuilt
// from scratch on every deploy.
const PRERENDER_DAYS = 14

export const dynamicParams = true

export async function generateStaticParams(): Promise<{ date: string }[]> {
  if (process.env.NODE_ENV === "development") {
    return []
  }
  const { endDate } = await getLeaderboardDateRange()
  const dates: string[] = []
  // Don't cache the last date because it's handled by /latest
  const lastDate = subDays(new TZDate(endDate, "UTC"), 1)
  let currentDate = subDays(lastDate, PRERENDER_DAYS - 1)

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

export default async function DatePage({
  params,
}: Props): Promise<React.ReactElement> {
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
        leaderboard={{ json: leaderboard.json }}
        dateRange={dateRange}
        avatars={avatars}
      />
    </div>
  )
}

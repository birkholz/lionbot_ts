"use client"

import { LeaderboardDisplay } from "@components/leaderboard-display"
import { useLeaderboardState } from "@components/leaderboard-state"
import type { DateRange } from "@services/leaderboard"
import type { LeaderboardJson } from "@types"
import type { PBInfo } from "../types/peloton"
import { mean } from "mathjs"
import { use, useEffect, useRef } from "react"

interface Props {
  date: string
  leaderboard: {
    json: LeaderboardJson
  }
  dateRange: Promise<DateRange>
  avatars: Record<string, string>
}

export function LeaderboardPage({
  date,
  leaderboard,
  dateRange,
  avatars,
}: Props) {
  const { setDate, setDateRange } = useLeaderboardState()
  const range = use(dateRange)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    setDate(date)
    setDateRange(range)
  }, [date, range, setDate, setDateRange])

  const getAvatarUrl = (username: string) => {
    if (process.env.NODE_ENV === "development") {
      return "https://placehold.co/21x21/red/red.webp"
    }
    return avatars[username]
  }

  const data = leaderboard.json as LeaderboardJson
  const rides = Object.entries(data.rides).map(([_, ride]) => ({
    id: ride.id,
    title: ride.title,
    instructor_name: ride.instructor_name,
    start_time: ride.start_time,
    url: ride.url,
    image_url: ride.image_url,
    workouts: ride.workouts.map((w) => ({
      user_username: w.user_username,
      avatar_url: getAvatarUrl(w.user_username),
      total_work: w.total_work,
      is_new_pb: w.is_new_pb,
      strive_score: w.strive_score ?? null,
      avg_cadence: w.avg_cadence ?? null,
      avg_resistance: w.avg_resistance ?? null,
      distance: w.distance ?? null,
      duration: w.duration,
      effort_zones: w.effort_zones,
    })),
  }))

  const totals = data.totals
  const playersWhoPbd = data.playersWhoPbd

  const totalsList = Object.entries(totals)
    .map(([username, total]) => ({
      username,
      avatar_url: getAvatarUrl(username),
      output: total.output,
      rides: total.rides,
      duration: total.duration,
    }))
    .sort((a, b) => b.output - a.output)

  const totalRiders = totalsList.length
  const rideCounts = totalsList.map((w) => w.rides)
  const averageRideCount = mean(rideCounts)
  const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0)
  const PBList = Object.entries(playersWhoPbd)
    .map(
      ([username, pbs]) =>
        [username, getAvatarUrl(username), pbs] as [
          string,
          string | undefined,
          PBInfo[],
        ],
    )
    .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()))

  return (
    <LeaderboardDisplay
      rides={rides}
      totals={totals}
      totalsList={totalsList}
      totalRiders={totalRiders}
      averageRideCount={averageRideCount}
      totalOutput={totalOutput}
      PBList={PBList}
    />
  )
}

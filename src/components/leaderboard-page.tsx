"use client"

import { LeaderboardDisplay } from "@components/leaderboard-display"
import { useLeaderboardState } from "@components/leaderboard-state"
import type { DateRange } from "@services/leaderboard"
import type { LeaderboardJson, PBInfo } from "@types"
import { mean } from "mathjs"
import { use, useEffect, useRef } from "react"

interface Props {
  date: string
  leaderboard: {
    json: LeaderboardJson
  }
  dateRange: Promise<DateRange>
  avatars: Array<{ username: string; avatar_url: string }>
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

  const data = leaderboard.json as LeaderboardJson
  const rides = Object.entries(data.rides).map(([_, ride]) => ({
    id: ride.id,
    title: ride.title,
    instructor_name: ride.instructor_name,
    start_time: ride.start_time,
    url: ride.url,
    image_url: ride.image_url,
    workouts: ride.workouts.map((w) => ({
      user_id: w.user_id,
      user_username: w.user_username,
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

  const totalsList = Object.values(totals).sort((a, b) => b.output - a.output)
  const totalRiders = totalsList.length
  const rideCounts = totalsList.map((w) => w.rides)
  const averageRideCount = Number(mean(rideCounts))
  const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0)

  // Create a mapping from user_id to username for PB list
  const userIdToUsername = Object.fromEntries(
    Object.entries(totals).map(([user_id, userTotal]) => [
      user_id,
      userTotal.username,
    ]),
  )

  // Map the PB list to use usernames instead of user IDs
  const PBList = Object.entries(playersWhoPbd)
    .map(([user_id, pbs]) => [userIdToUsername[user_id], pbs])
    .filter((entry): entry is [string, PBInfo[]] => entry[0] !== undefined)
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
      avatars={avatars}
    />
  )
}

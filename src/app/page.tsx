"use client"

import { useLeaderboardState } from "@components/leaderboard-state"
import { subDays, format } from "date-fns"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { setDate } = useLeaderboardState()

  useEffect(() => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd")
    setDate(yesterday)
    redirect(`/archive/${yesterday}`)
  }, [setDate])

  return null
}

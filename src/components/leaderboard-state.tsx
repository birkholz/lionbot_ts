"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { DateRange } from "@services/leaderboard"

interface LeaderboardState {
  date: string | null
  dateRange: DateRange | null
  useMetric: boolean
  numberFormat: string
  autoOpen: boolean
  setDate: (date: string) => void
  setDateRange: (range: DateRange) => void
  setUseMetric: (value: boolean) => void
  setNumberFormat: (value: string) => void
  setAutoOpen: (value: boolean) => void
}

const LeaderboardContext = createContext<LeaderboardState | null>(null)

export function LeaderboardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [date, setDate] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [mounted, setMounted] = useState(false)
  const [useMetric, setUseMetric] = useState(true)
  const [numberFormat, setNumberFormat] = useState("en-US")
  const [autoOpen, setAutoOpen] = useState(false)

  useEffect(() => {
    const savedMetric = localStorage.getItem("useMetric")
    const savedFormat = localStorage.getItem("numberFormat")
    const savedAutoOpen = localStorage.getItem("autoOpen")

    if (savedMetric !== null) setUseMetric(savedMetric === "true")
    if (savedFormat) setNumberFormat(savedFormat)
    if (savedAutoOpen !== null) setAutoOpen(savedAutoOpen === "true")
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("useMetric", useMetric.toString())
  }, [mounted, useMetric])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("numberFormat", numberFormat)
  }, [mounted, numberFormat])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("autoOpen", autoOpen.toString())
  }, [mounted, autoOpen])

  return (
    <LeaderboardContext.Provider
      value={{
        date,
        dateRange,
        useMetric,
        numberFormat,
        autoOpen,
        setDate,
        setDateRange,
        setUseMetric,
        setNumberFormat,
        setAutoOpen,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  )
}

export function useLeaderboardState() {
  const context = useContext(LeaderboardContext)
  if (!context) {
    throw new Error(
      "useLeaderboardState must be used within LeaderboardProvider",
    )
  }
  return context
}

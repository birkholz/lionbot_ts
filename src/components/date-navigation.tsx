"use client"

import { parseDate } from "@lib/utils"
import { addDays, format, isSameDay, subDays } from "date-fns"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLeaderboardState } from "./leaderboard-state"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export function DateNavigation() {
  const router = useRouter()
  const { date, dateRange } = useLeaderboardState()

  // Default to yesterday if no date or date range is provided
  const yesterday = parseDate(format(subDays(new Date(), 1), "yyyy-MM-dd"))
  const displayDate = date ? parseDate(date) : yesterday
  const startDate = dateRange ? parseDate(dateRange.startDate) : yesterday
  const endDate = dateRange ? parseDate(dateRange.endDate) : yesterday

  const prevDate = format(subDays(displayDate, 1), "yyyy-MM-dd")
  const nextDate = format(addDays(displayDate, 1), "yyyy-MM-dd")
  const isPrevDisabled = isSameDay(displayDate, startDate)
  const isNextDisabled = isSameDay(displayDate, endDate)
  const nextLink = isSameDay(addDays(displayDate, 1), endDate)
    ? "/latest"
    : `/archive/${nextDate}`

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      if (isSameDay(newDate, endDate)) {
        router.push("/latest")
      } else {
        router.push(`/archive/${format(newDate, "yyyy-MM-dd")}`)
      }
    }
  }

  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-center text-2xl font-semibold tracking-tight">
      {isPrevDisabled ? (
        <span className="cursor-not-allowed text-zinc-500">
          <ArrowLeft size={30} />
        </span>
      ) : (
        <Link
          href={`/archive/${prevDate}`}
          className="text-blue-500 hover:text-blue-400 hover:underline"
        >
          <ArrowLeft size={30} />
        </Link>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <span className="cursor-pointer select-none">
            {format(displayDate, "yyyy-MM-dd")}
          </span>
        </PopoverTrigger>
        <PopoverContent className="bg-zinc-950">
          <Calendar
            mode="single"
            selected={displayDate}
            onSelect={handleDateSelect}
            disabled={{ after: endDate, before: startDate }}
            startMonth={startDate}
            endMonth={endDate}
            defaultMonth={displayDate}
            required
          />
        </PopoverContent>
      </Popover>
      {isNextDisabled ? (
        <span className="text-zinc-500">
          <ArrowRight size={30} />
        </span>
      ) : (
        <Link
          href={nextLink}
          className="text-blue-500 hover:text-blue-400 hover:underline"
        >
          <ArrowRight size={30} />
        </Link>
      )}
    </div>
  )
}

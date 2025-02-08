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
  const { date, dateRange, setDate } = useLeaderboardState()

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
        setDate(format(newDate, "yyyy-MM-dd"))
        router.push("/latest")
      } else {
        const formattedDate = format(newDate, "yyyy-MM-dd")
        setDate(formattedDate)
        router.push(`/archive/${formattedDate}`)
      }
    }
  }

  const handlePrevClick = () => {
    if (!isPrevDisabled) {
      setDate(prevDate)
    }
  }

  const handleNextClick = () => {
    if (!isNextDisabled) {
      const nextDateStr = format(addDays(displayDate, 1), "yyyy-MM-dd")
      setDate(nextDateStr)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 text-center text-3xl font-semibold tracking-tight md:mt-2">
      {isPrevDisabled ? (
        <span className="pointer-events-none text-zinc-500">
          <ArrowLeft size={30} />
        </span>
      ) : (
        <Link
          href={`/archive/${prevDate}`}
          className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
          onClick={handlePrevClick}
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
        <PopoverContent>
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
          className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
          onClick={handleNextClick}
        >
          <ArrowRight size={30} />
        </Link>
      )}
    </div>
  )
}

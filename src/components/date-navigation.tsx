"use client"

import { addDays, format, isSameDay, subDays } from "date-fns"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import React from "react"

type Props = {
  date: Date
  startDate: Date
  endDate: Date
}

export function DateNavigation({ date, startDate, endDate }: Props) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = React.useState<Date>(date)

  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const prevDate = format(subDays(date, 1), "yyyy-MM-dd")
  const nextDate = format(addDays(date, 1), "yyyy-MM-dd")
  const isPrevDisabled = isSameDay(date, startDate)
  const isNextDisabled = isSameDay(date, endDate)
  const nextLink = isSameDay(addDays(date, 1), endDate)
    ? "/latest"
    : `/archive/${nextDate}`

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
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
            {format(date, "yyyy-MM-dd")}
          </span>
        </PopoverTrigger>
        <PopoverContent className="bg-zinc-950">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ after: endDate, before: startDate }}
            startMonth={startDate}
            endMonth={endDate}
            defaultMonth={date}
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

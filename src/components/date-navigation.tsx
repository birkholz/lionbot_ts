"use client"

import { addDays, format, isSameDay, subDays } from "date-fns"
import { ArrowLeft, ArrowRight } from "lucide-react"
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

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      router.push(`/archive/${format(newDate, "yyyy-MM-dd")}`)
    }
  }

  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-center text-2xl font-semibold tracking-tight">
      <button
        className="text-blue-500 hover:text-blue-400 hover:underline disabled:cursor-not-allowed disabled:text-zinc-500 disabled:hover:text-zinc-500 disabled:hover:no-underline"
        onClick={() =>
          router.push(`/archive/${format(subDays(date, 1), "yyyy-MM-dd")}`)
        }
        disabled={isSameDay(date, startDate)}
      >
        <ArrowLeft size={30} />
      </button>
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
            // disabled={isDisabledDate}
            disabled={{ after: endDate, before: startDate }}
            startMonth={startDate}
            endMonth={endDate}
            required
          />
        </PopoverContent>
      </Popover>
      <button
        className="text-blue-500 hover:text-blue-400 hover:underline disabled:cursor-not-allowed disabled:text-zinc-500 disabled:hover:text-zinc-500 disabled:hover:no-underline"
        onClick={() =>
          router.push(`/archive/${format(addDays(date, 1), "yyyy-MM-dd")}`)
        }
        disabled={isSameDay(date, endDate)}
      >
        <ArrowRight size={30} />
      </button>
    </div>
  )
}

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

  // TODO: populate this from the database
  // const datesWithData = [new Date(2025, 0, 26), new Date(2025, 0, 28)]

  // const isDisabledDate = (date: Date) => {
  //   return datesWithData.every((d) => !isSameDay(date, d))
  // }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      router.push(`/${format(newDate, "yyyy-MM-dd")}`)
    }
  }

  React.useEffect(() => {
    setSelectedDate(date)
  }, [date])

  return (
    <div className="flex items-center justify-center gap-2 text-center text-2xl font-semibold tracking-tight">
      <button
        className="text-blue-500 hover:text-blue-400 hover:underline"
        onClick={() =>
          router.push(`/${format(subDays(date, 1), "yyyy-MM-dd")}`)
        }
      >
        <ArrowLeft />
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
        className="text-blue-500 hover:text-blue-400 hover:underline"
        onClick={() =>
          router.push(`/${format(addDays(date, 1), "yyyy-MM-dd")}`)
        }
      >
        <ArrowRight />
      </button>
    </div>
  )
}

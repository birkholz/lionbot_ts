import { DateNavigation } from "@components/date-navigation"
import { Separator } from "@components/ui/separator"
import { parseDate } from "@lib/utils"
import type { DateRange } from "../services/leaderboard"

interface Props {
  children: React.ReactNode
  date: string
  dateRange: DateRange
}

export function Layout({ children, date, dateRange }: Props) {
  const displayDate = parseDate(date)

  return (
    <>
      <DateNavigation
        date={displayDate}
        startDate={parseDate(dateRange.startDate)}
        endDate={parseDate(dateRange.endDate)}
      />
      <Separator className="mt-2" />
      {children}
    </>
  )
}

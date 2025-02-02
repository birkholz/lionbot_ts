import { Layout } from "@components/layout"
import type { DateRange } from "../services/leaderboard"

interface Props {
  date: string
  dateRange: DateRange
}

export function NoLeaderboard({ date, dateRange }: Props) {
  return (
    <Layout date={date} dateRange={dateRange}>
      <p className="mt-4 text-center">No leaderboard data available.</p>
    </Layout>
  )
}

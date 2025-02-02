import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import type { GetServerSideProps } from "next"
import {
  getLatestLeaderboard,
  getLeaderboardDateRange,
  type DateRange,
  type Leaderboard,
} from "../services/leaderboard"

interface Props {
  date: string
  leaderboard: Leaderboard | null
  dateRange: DateRange
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [leaderboard, dateRange] = await Promise.all([
    getLatestLeaderboard(),
    getLeaderboardDateRange(),
  ])
  const date = leaderboard?.date || new Date().toISOString().split("T")[0]

  return {
    props: {
      date,
      leaderboard,
      dateRange,
    },
  }
}

export default function Latest({ date, leaderboard, dateRange }: Props) {
  if (!leaderboard || !leaderboard.json) {
    return <NoLeaderboard date={date} dateRange={dateRange} />
  }

  return (
    <LeaderboardPage
      date={date}
      leaderboard={leaderboard}
      dateRange={dateRange}
    />
  )
}

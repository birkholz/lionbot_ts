import { LeaderboardPage } from "@components/leaderboard-page"
import { NoLeaderboard } from "@components/no-leaderboard"
import { isMatch } from "date-fns"
import type { GetServerSideProps } from "next"
import {
  getLeaderboardByDate,
  getLeaderboardDateRange,
  type DateRange,
  type Leaderboard,
} from "../../services/leaderboard"

interface Props {
  date: string
  leaderboard: Leaderboard | null
  dateRange: DateRange
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const date = context.params?.date as string
  if (!isMatch(date, "yyyy-MM-dd")) {
    return {
      redirect: {
        destination: "/latest",
        permanent: false,
      },
    }
  }

  const [leaderboard, dateRange] = await Promise.all([
    getLeaderboardByDate(date),
    getLeaderboardDateRange(),
  ])

  if (date === dateRange.endDate) {
    return {
      redirect: {
        destination: "/latest",
        permanent: false,
      },
    }
  }

  return {
    props: {
      date,
      leaderboard,
      dateRange,
    },
  }
}

export default function DatePage({ date, leaderboard, dateRange }: Props) {
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

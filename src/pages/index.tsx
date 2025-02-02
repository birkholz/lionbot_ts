import { TZDate } from "@date-fns/tz"
import { db } from "@db/client"
import { leaderboardsTable } from "@db/schema"
import { format, subDays } from "date-fns"
import { desc } from "drizzle-orm"
import type { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async () => {
  const [latestLeaderboard] = await db
    .select({ date: leaderboardsTable.date })
    .from(leaderboardsTable)
    .orderBy(desc(leaderboardsTable.date))
    .limit(1)

  const latestDate =
    latestLeaderboard?.date ?? subDays(new TZDate("America/Los_Angeles"), 1)

  return {
    redirect: {
      destination: `/${format(latestDate, "yyyy-MM-dd")}`,
      permanent: false,
    },
  }
}

export default function Home() {
  return null
}

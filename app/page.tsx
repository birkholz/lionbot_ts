import { redirect } from "next/navigation"
import { format } from "date-fns"
import { db } from "../lionbot/db/client"
import { leaderboardsTable } from "../lionbot/db/schema"
import { desc } from "drizzle-orm"
import { parseDate } from "../lionbot/utils"

export default async function Page() {
  const [lastLeaderboard] = await db
    .select({ date: leaderboardsTable.date })
    .from(leaderboardsTable)
    .orderBy(desc(leaderboardsTable.date))
    .limit(1)
  const date = parseDate(
    lastLeaderboard?.date ?? format(new Date(), "yyyy-MM-dd"),
  )
  redirect(`/${format(date, "yyyy-MM-dd")}`)
}

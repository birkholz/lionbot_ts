import { db } from "@db/client"
import { cyclistsTable, leaderboardsTable } from "@db/schema"
import type { UserTotal } from "@types"
import { isNotNull, sql } from "drizzle-orm"

async function backfillHighestOutput(dryRun: boolean) {
  console.log("Loading leaderboard history...")

  const [rows, shownCyclists] = await Promise.all([
    db.select({ json: leaderboardsTable.json }).from(leaderboardsTable),
    db
      .select({ user_id: cyclistsTable.user_id })
      .from(cyclistsTable)
      .where(isNotNull(cyclistsTable.first_ride)),
  ])
  const shownUserIds = new Set(shownCyclists.map((c) => c.user_id))

  const bestOutput: Record<string, number> = {}

  for (const row of rows) {
    const totals = (row.json as { totals?: Record<string, UserTotal> } | null)
      ?.totals
    if (!totals) continue

    for (const [userId, total] of Object.entries(totals)) {
      if (!shownUserIds.has(userId)) continue
      const output = Math.round(total.output)
      if (!bestOutput[userId] || output > bestOutput[userId]) {
        bestOutput[userId] = output
      }
    }
  }

  const existing = await db
    .select({
      user_id: cyclistsTable.user_id,
      username: cyclistsTable.username,
      highest_output: cyclistsTable.highest_output,
    })
    .from(cyclistsTable)
  const existingByUserId = new Map(existing.map((u) => [u.user_id, u]))

  if (dryRun) {
    console.log(
      `Dry run — showing first 100 of ${Object.keys(bestOutput).length} cyclists (username | current -> new, GREATEST):`,
    )
    Object.entries(bestOutput)
      .slice(0, 100)
      .forEach(([user_id, newValue]) => {
        const current = existingByUserId.get(user_id)
        const merged = Math.max(current?.highest_output ?? 0, newValue)
        console.log(
          `${current?.username ?? user_id} | ${current?.highest_output ?? "null"} -> ${merged}`,
        )
      })
    console.log("Dry run complete. No changes written.")
    return
  }

  const updates = Object.entries(bestOutput).map(
    ([user_id, highest_output]) => ({
      user_id,
      username: "",
      avatar_url: "",
      highest_output,
    }),
  )

  console.log(`Recomputed highest_output for ${updates.length} cyclists`)

  if (updates.length > 0) {
    await db
      .insert(cyclistsTable)
      .values(updates)
      .onConflictDoUpdate({
        target: cyclistsTable.user_id,
        set: {
          highest_output: sql`GREATEST(COALESCE(${cyclistsTable.highest_output}, 0), excluded.highest_output)`,
        },
      })
  }

  console.log("Done.")
}

await backfillHighestOutput(process.argv.includes("--dry-run"))
process.exit(0)

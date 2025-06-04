import { db } from "@db/client"
import { cyclistsTable } from "@db/schema"
import { sql } from "drizzle-orm"

async function cleanupDuplicateCyclists() {
  console.log("Finding duplicate cyclists...")

  // Find all cyclists with duplicate user_ids
  const duplicates = await db
    .select({
      user_id: cyclistsTable.user_id,
      count: sql<number>`count(*)`,
    })
    .from(cyclistsTable)
    .groupBy(cyclistsTable.user_id)
    .having(sql`count(*) > 1`)

  console.log(`Found ${duplicates.length} users with duplicate entries`)

  for (const dup of duplicates) {
    // Get all entries for this user_id
    const entries = await db
      .select()
      .from(cyclistsTable)
      .where(sql`${cyclistsTable.user_id} = ${dup.user_id}`)

    // Keep the first entry and delete the rest
    const toDelete = entries.slice(1)
    if (toDelete.length > 0 && entries[0]) {
      console.log(
        `Found ${entries.length} entries for user ${entries[0].username} (${dup.user_id})`,
      )

      const result = await db
        .delete(cyclistsTable)
        .where(
          sql`${cyclistsTable.user_id} = ${dup.user_id} AND ${cyclistsTable.username} != ${entries[0].username}`,
        )
        .returning()

      console.log(`Deleted ${result.length} entries`)
    }
  }

  console.log("Cleanup complete!")
  process.exit(0)
}

await cleanupDuplicateCyclists()

import { PelotonAPI } from "@lib/peloton"
import { db } from "@db/client"
import { cyclistsTable } from "@db/schema"
import { sql } from "drizzle-orm"

export async function processAndFollowFollowers(): Promise<void> {
  const peloton = new PelotonAPI()

  const userId = "8e72aa494a744541a238a76648c1aa8a" // Lionbot's user ID
  let processedFollowers = 0
  let followedCount = 0

  console.log("Starting to fetch and process followers...")

  try {
    // Get all followers and existing cyclists
    const [followers, existingCyclists] = await Promise.all([
      peloton.getAllFollowers(userId),
      db.select({ user_id: cyclistsTable.user_id }).from(cyclistsTable),
    ])

    console.log(`Total followers: ${followers.length}`)
    const existingUserIds = new Set(existingCyclists.map((c) => c.user_id))
    const existingFollowers = followers.filter((f) => existingUserIds.has(f.id))
    const newFollowers = followers.filter((f) => !existingUserIds.has(f.id))
    const followersToFollow = followers.filter(
      (f) => f.relationship.me_to_user === "none",
    )

    console.log(`New followers to check: ${newFollowers.length}`)
    console.log(`Followers to follow back: ${followersToFollow.length}`)
    console.log("Checking tag membership for new followers...")
    const cyclistsData: Array<{
      username: string
      user_id: string
      avatar_url: string
    }> = []
    const tagFollowerIds = new Set<string>()

    // Update existing cyclist data
    for (const follower of existingFollowers) {
      cyclistsData.push({
        username: follower.username,
        user_id: follower.id,
        avatar_url: follower.image_url || "",
      })
    }

    // Check if new followers are in the tag before following/adding to DB
    for (const follower of newFollowers) {
      const userDetails = await peloton.getUserDetails(follower.id)
      if (userDetails?.tags_info?.primary_name === "TheEggCarton") {
        cyclistsData.push({
          username: follower.username,
          user_id: follower.id,
          avatar_url: follower.image_url || "",
        })
        tagFollowerIds.add(follower.id)
      }
    }

    // Follow back tag followers
    const tagFollowersToFollow = followersToFollow.filter((f) =>
      tagFollowerIds.has(f.id),
    )

    for (const follower of tagFollowersToFollow) {
      console.log(`Following user: ${follower.username} (${follower.id})`)

      const success = await peloton.followUser(follower.id)
      if (success) {
        followedCount++
      } else {
        console.error(`Failed to follow ${follower.username}`)
      }
    }

    processedFollowers = followers.length

    // Add/Update cyclists in DB
    if (cyclistsData.length > 0) {
      console.log(
        `Inserting ${cyclistsData.length} tag members to cyclists table...`,
      )
      await db
        .insert(cyclistsTable)
        .values(cyclistsData)
        .onConflictDoUpdate({
          target: cyclistsTable.user_id,
          set: {
            username: sql`excluded.username`,
            avatar_url: sql`excluded.avatar_url`,
          },
        })
    }

    console.log(
      `Completed processing followers. Total processed: ${processedFollowers}, New follows: ${followedCount}`,
    )
  } catch (error) {
    console.error("Error processing followers:", error)
    throw error
  }
}

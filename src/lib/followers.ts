import { PelotonAPI } from "@lib/peloton"

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function processAndFollowFollowers(): Promise<void> {
  const peloton = new PelotonAPI()
  await peloton.login()

  const userId = "8e72aa494a744541a238a76648c1aa8a" // Lionbot's user ID
  let processedFollowers = 0
  let followedCount = 0

  console.log("Starting to fetch and process followers...")

  try {
    // Get all followers using the PelotonAPI method
    const followers = await peloton.getAllFollowers(userId)
    console.log(`Total followers: ${followers.length}`)

    // Process each follower
    for (const follower of followers) {
      processedFollowers++

      // Check if we're not already following this user
      if (follower.relationship.me_to_user === "none") {
        console.log(`Following user: ${follower.username} (${follower.id})`)

        const success = await peloton.followUser(follower.id)
        if (!success) {
          console.error(`Failed to follow ${follower.username}`)
        }

        // Wait 1 second after each follow request to avoid rate limiting
        await sleep(1000)
      }
    }

    console.log(
      `Completed processing followers. Total processed: ${processedFollowers}, New follows: ${followedCount}`,
    )
  } catch (error) {
    console.error("Error processing followers:", error)
    throw error
  }
}

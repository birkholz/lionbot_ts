import { processAndFollowFollowers } from "@lib/followers"

async function followFollowers(): Promise<void> {
  try {
    await processAndFollowFollowers()
  } catch (error) {
    process.exit(1)
  }
}

await followFollowers()
process.exit(0)

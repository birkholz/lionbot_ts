import { backfillScenicRideImages } from "@lib/scenic-rides"

async function main(): Promise<void> {
  try {
    const updated = await backfillScenicRideImages()
    console.info(`Updated image_url for ${updated} scenic ride(s)`)
    process.exit(0)
  } catch (error) {
    console.error("Error backfilling scenic ride images:", error)
    process.exit(1)
  }
}

await main()

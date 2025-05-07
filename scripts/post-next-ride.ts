import { processAndPostNextRide } from "@lib/scenic-rides"

async function main() {
  try {
    await processAndPostNextRide()
    process.exit(0)
  } catch (error) {
    console.error("Error processing and posting next ride:", error)
    process.exit(1)
  }
}

await main()

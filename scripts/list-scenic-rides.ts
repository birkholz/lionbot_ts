import { PelotonAPI } from "@lib/peloton"
import { format } from "date-fns"

async function listScenicRides(): Promise<void> {
  const api = new PelotonAPI()

  try {
    const rides = await api.getArchivedRides(100, 0, 5400, "virtual_active")
    console.info(`Found ${rides.total} scenic rides:`)
    console.info("")

    for (const ride of rides.data) {
      const date = new Date(ride.original_air_time * 1000)
      // There are no unavailable rides?
      // const status = ride.availability.is_available
      //   ? "✅ Available"
      //   : "❌ Unavailable"
      console.info(
        `${ride.title} (${ride.location}) - Published ${format(date, "yyyy-MM-dd")}`,
      )
    }
  } catch (error) {
    console.error("Failed to fetch scenic rides:", error)
    process.exit(1)
  }
}

await listScenicRides()
process.exit(0)

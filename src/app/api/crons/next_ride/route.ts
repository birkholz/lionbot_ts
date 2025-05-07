import { isCronTimeValid } from "@lib/utils"
import { processAndPostNextRide } from "@lib/scenic-rides"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const maxDuration = 300

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (authHeader !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Cron runs at 7 PM PST and PDT
  if (!isCronTimeValid(19)) {
    return NextResponse.json(
      { error: "Current time is not 7 PM PT" },
      { status: 400 },
    )
  }

  try {
    await processAndPostNextRide()
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in next ride cron:", error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

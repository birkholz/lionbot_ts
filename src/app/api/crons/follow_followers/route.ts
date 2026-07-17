import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { processAndFollowFollowers } from "@lib/followers"
import { isCronTimeValid } from "@lib/utils"

export async function GET(): Promise<NextResponse> {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (authHeader !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Cron runs daily at 6 AM PST/PDT
  if (!isCronTimeValid(6)) {
    return NextResponse.json(
      { error: "Current time is not 6 AM PT" },
      { status: 400 },
    )
  }

  try {
    await processAndFollowFollowers()
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in follow followers cron:", error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

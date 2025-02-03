import { TZDate } from "@date-fns/tz"
import { addMinutes, isWithinInterval, subMinutes } from "date-fns"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (authHeader !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Cron runs at 9 AM PST and PDT
  // we only want to run if its currently 9 AM in the Pacific timezone
  const jsNow = new Date()
  // Vercel servers have UTC as the default timezone
  const now = new TZDate(
    jsNow.getFullYear(),
    jsNow.getMonth(),
    jsNow.getDate(),
    jsNow.getHours(),
    jsNow.getMinutes(),
    jsNow.getSeconds(),
    "UTC",
  )
  const targetTime = new TZDate(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    0,
    0,
    "America/Los_Angeles",
  )
  console.log(`Current Time: ${now.toISOString()}`)
  console.log(`Target Time: ${targetTime.toISOString()}`)

  if (
    isWithinInterval(now, {
      start: subMinutes(targetTime, 5),
      end: addMinutes(targetTime, 5),
    })
  ) {
    // Start the process and let it run in the background
    const proc = Bun.spawn(["bun", "run", "leaderboards"], {
      stdout: "inherit",
    })
    proc.unref()

    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json(
    { error: "Current time is not 9 AM PT" },
    { status: 400 },
  )
}

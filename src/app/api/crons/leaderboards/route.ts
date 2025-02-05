import { TZDate } from "@date-fns/tz"
import { addMinutes, isWithinInterval, subMinutes } from "date-fns"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { spawn } from "child_process"

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

  if (
    isWithinInterval(now, {
      start: subMinutes(targetTime, 5),
      end: addMinutes(targetTime, 5),
    })
  ) {
    // Start the process and let it run in the background
    const proc = spawn("npm", ["run", "leaderboards"], {
      stdio: "inherit",
      detached: true,
    })
    proc.unref()

    revalidatePath("/leaderboard")
    revalidatePath("/users")

    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json(
    { error: "Current time is not 9 AM PT" },
    { status: 400 },
  )
}

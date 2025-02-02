"use server"

import { TZDate } from "@date-fns/tz"
import { addMinutes, isWithinInterval, set, subMinutes } from "date-fns"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  // Cron runs at 9 AM PST and PDT
  // we only want to run if its currently 9 AM in the Pacific timezone
  const now = new TZDate("America/Los_Angeles")
  const targetTime = set(now, {
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  const interval = {
    start: subMinutes(targetTime, 5),
    end: addMinutes(targetTime, 5),
  }

  if (isWithinInterval(now, interval)) {
    // Start the process and let it run in the background
    const proc = Bun.spawn(["bun", "run", "leaderboards"], {
      stdout: "inherit",
    })
    proc.unref()

    return res.status(204).send("")
  }

  return res.status(400).json({ error: "Current time is not 9 AM PT" })
}

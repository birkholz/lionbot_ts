import { clsx, type ClassValue } from "clsx"
import { mean, median } from "mathjs"
import ordinal from "ordinal"
import pluralize from "pluralize"
import { twMerge } from "tailwind-merge"
import { TZDate } from "@date-fns/tz"
import type { EffortZones, PBInfo, UserTotal } from "@types"

export interface DiscordEmbed {
  type: string
  title: string
  description: string
  url: string
  thumbnail: {
    url: string
  }
  fields: {
    name: string
    value: string
    inline: boolean
  }[]
}

export class RideInfo {
  id: string
  title: string
  instructor_name: string
  start_time: number
  url: string
  image_url: string
  workouts: WorkoutInfo[]

  constructor(
    id: string,
    title: string,
    instructor_name: string,
    start_time: number,
    url: string,
    image_url: string,
  ) {
    this.id = id
    this.title = title
    this.instructor_name = instructor_name
    this.start_time = start_time
    this.url = url
    this.image_url = image_url
    this.workouts = []
  }

  sortedWorkouts(): WorkoutInfo[] {
    return [...this.workouts].sort((a, b) => b.total_work - a.total_work)
  }

  getOutputs(): number[] {
    return this.workouts.map((w) => w.total_work)
  }

  getMedianOutput(): number {
    const outputs = this.getOutputs()
    return outputs.length > 0 ? median(outputs) : 0
  }

  getMeanOutput(): number {
    const outputs = this.getOutputs()
    return outputs.length > 0 ? Number(mean(outputs)) : 0
  }
}

export class WorkoutInfo {
  constructor(
    public user_username: string,
    public total_work: number,
    public is_new_pb: boolean,
    public avg_cadence: number,
    public avg_resistance: number,
    public distance: number,
    public duration: number,
    public effort_zones: EffortZones | null,
  ) {}

  getOutputString(): string {
    return `${this.user_username} - **${Math.round(this.total_work / 1000)}** kJ`
  }

  getPBString(): string {
    return this.is_new_pb ? " (⭐ **NEW PB** ⭐)" : ""
  }
}

export function formatNumber(num: number): string {
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}

export function hasNoDuration(workout: {
  start_time: number
  end_time: number | null
}): boolean {
  const startTime = new Date(workout.start_time * 1000)
  if (!workout.end_time) {
    return true
  }

  const endTime = new Date(workout.end_time * 1000)
  if (endTime.getTime() - startTime.getTime() === 0) {
    return true
  }

  return false
}

export function validWorkout(workout: any): boolean {
  if (
    workout.status !== "COMPLETE" ||
    hasNoDuration(workout) ||
    workout.metrics_type !== "cycling"
  ) {
    return false
  }
  return true
}

export function rideCountStr(
  totals: Record<string, UserTotal>,
  workout: { user_username: string },
): string {
  const total = totals[workout.user_username]
  if (!total) {
    return ""
  }

  const rideCount = total.rides
  return `(${rideCount} ${pluralize("ride", rideCount)})`
}

export function pbListStr(pbDict: PBInfo[]): string {
  return pbDict
    .map(
      (pb) => `**${Math.round(pb.total_work / 1000)}** kJ/${pb.duration} mins`,
    )
    .join(", ")
}

export function getInstructorName(workout: any): string {
  const instructor = workout.ride?.instructor
  if (!instructor) {
    return workout.ride?.description ?? "n/a"
  }
  return instructor.name ?? "n/a"
}

export function sendDiscordRequest(
  requestMethod: string,
  endpoint: string,
  requestBody: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const messageUrl = `https://discordapp.com/api/${endpoint}`
  const headers = {
    Authorization: `Bot ${process.env["DISCORD_TOKEN"]}`,
    "Content-Type": "application/json",
  }

  const request = new Request(messageUrl, {
    method: requestMethod,
    headers: headers,
    body: JSON.stringify(requestBody),
  })

  return fetch(request).then((response) => {
    if (!response.ok) {
      // Sentry.captureException("Discord Error", {
      //     extra: {
      //         "source": "Discord",
      //         "request.body": requestBody,
      //         "response.body": response.body
      //     }
      // })
    }
    if (response.status != 204) {
      return response.json()
    }
    return {}
  })
}

export function isWithinInterval(
  timestamp: number,
  intervalMs: number,
): boolean {
  const dt = new Date(timestamp * 1000)
  const now = new Date()
  const minDt = new Date(now.getTime() - intervalMs)
  return dt > minDt
}

export function humanize(i: number): string {
  return ordinal(i + 1)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseDate(date: string): Date {
  const [yearStr, monthStr, dayStr] = date.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date format: ${date}`)
  }

  return new TZDate(year, month - 1, day, "America/Los_Angeles")
}

export function localizeNumber(
  x: number,
  locale: string = "en-US",
  fractionDigits: number = 2,
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
  }).format(x)
}

export function getAvatarUrl(
  username: string,
  avatars: Array<{ username: string; avatar_url: string }>,
): string {
  const avatar = avatars.find((a) => a.username === username)
  return avatar?.avatar_url ?? `https://placehold.co/21x21/red/red.webp`
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 2000,
): Promise<T> {
  let delay = initialDelay
  let retryCount = 0

  while (true) {
    try {
      return await operation()
    } catch (error) {
      retryCount++
      if (retryCount > maxRetries) {
        console.error(`Failed after ${maxRetries} retries:`, error)
        throw error
      }

      console.warn(
        `Attempt ${retryCount} failed, retrying in ${delay}ms:`,
        error,
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
}

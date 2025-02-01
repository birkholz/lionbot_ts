import type { EffortZones, PBInfo, UserTotal } from "./peloton"

export type RideData = {
  id: string
  title: string
  instructor_name: string
  start_time: number
  url: string
  image_url: string
  workouts: {
    user_username: string
    total_work: number
    is_new_pb: boolean
    avg_cadence: number
    avg_resistance: number
    distance: number
    strive_score?: number
    duration: number
    effort_zones: EffortZones | null
  }[]
}

export type LeaderboardJson = {
  rides: Record<string, RideData>
  totals: Record<string, UserTotal>
  playersWhoPbd: Record<string, PBInfo[]>
}

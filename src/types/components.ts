import type { EffortZones, UserTotal } from "./peloton"

export type Workout = {
  user_username: string
  total_work: number
  is_new_pb: boolean
  avg_cadence: number
  avg_resistance: number
  distance: number
  duration: number
  effort_zones: EffortZones | null
}

export type Ride = {
  id: string
  title: string
  instructor_name: string
  start_time: number
  url: string
  image_url: string
  workouts: Workout[]
}

export type LeaderboardDisplayProps = {
  rides: Ride[]
  totals: Record<string, UserTotal>
  totalsList: UserTotal[]
  totalRiders: number
  averageRideCount: number
  totalOutput: number
  PBList: [string, { total_work: number; duration: number }[]][]
}

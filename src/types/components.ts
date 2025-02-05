import type { EffortZones, PBInfo, UserTotal } from "./peloton"

export type Workout = {
  user_username: string
  avatar_url?: string
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

export type UserTotalWithAvatar = {
  username: string
  avatar_url?: string
  output: number
  rides: number
  duration: number
}

export type LeaderboardDisplayProps = {
  rides: Ride[]
  totals: Record<string, UserTotal>
  totalsList: UserTotalWithAvatar[]
  totalRiders: number
  averageRideCount: number
  totalOutput: number
  PBList: [string, string | undefined, PBInfo[]][]
}

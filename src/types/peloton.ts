import { mean, median } from "mathjs"

export interface UserTotal {
  username: string
  output: number
  rides: number
  duration: number
}

export interface EffortZones {
  total_effort_points: number
  heart_rate_zone_durations: {
    heart_rate_z1_duration: number
    heart_rate_z2_duration: number
    heart_rate_z3_duration: number
    heart_rate_z4_duration: number
    heart_rate_z5_duration: number
  }
}

export interface PBInfo {
  total_work: number
  duration: number
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
    return outputs.length > 0 ? mean(outputs) : 0
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

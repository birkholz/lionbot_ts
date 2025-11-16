import { desc } from "drizzle-orm"
import { db } from "../db/client"
import { pelotonOAuthTokensTable } from "../db/schema"

// Types
interface PerformanceGraphResponse {
  duration: number
  is_class_plan_shown: boolean
  segment_list: Segment[]
  seconds_since_pedaling_start: number[]
  average_summaries: AverageSummary[]
  summaries: Summary[]
  metrics: Metric[]
  has_apple_watch_metrics: boolean
  splits_data: SplitsData
  splits_metrics: SplitsMetrics
  target_metrics_performance_data: {
    target_metrics: any[]
    time_in_metric: any[]
  }
  effort_zones: EffortZones
  muscle_group_score: any[]
  summary_available: boolean
  performance_graph_available: boolean
}

interface Metric {
  display_name: string
  display_unit: string
  max_value: number
  average_value: number
  values: number[]
  slug: string
  zones?: HeartRateZone[]
  missing_data_duration?: number
}

interface HeartRateZone {
  display_name: string
  slug: string
  range: string
  duration: number
  max_value: number
  min_value: number
}

interface Summary {
  display_name: string
  display_unit: string
  value: number
  slug: string
}

interface SplitsData {
  distance_marker_display_unit: string
  elevation_change_display_unit: string
  splits: Split[]
}

interface Split {
  distance_marker: number
  order: number
  seconds: number
  elevation_change: number | null
  has_floor_segment: boolean
  is_best: boolean
}

interface SplitsMetrics {
  header: SplitsHeader[]
  metrics: SplitMetric[]
}

interface SplitsHeader {
  slug: string
  display_name: string
}

interface SplitMetric {
  is_best: boolean
  has_floor_segment: boolean
  data: SplitMetricData[]
}

interface SplitMetricData {
  slug: string
  value: number
  unit: string
}

interface EffortZones {
  total_effort_points: number
  heart_rate_zone_durations: {
    heart_rate_z1_duration: number
    heart_rate_z2_duration: number
    heart_rate_z3_duration: number
    heart_rate_z4_duration: number
    heart_rate_z5_duration: number
  }
}

interface Segment {
  id: string
  length: number
  start_time_offset: number
  icon_url: string
  intensity_in_mets: number
  metrics_type: string
  icon_name: string
  icon_slug: string
  name: string
  is_drill: boolean
}

interface AverageSummary {
  display_name: string
  display_unit: string
  value: number
  slug: string
}

// Core workout interfaces
interface WorkoutResponse {
  data: Workout[]
  limit: number
  page: number
  total: number
  count: number
  page_count: number
  show_previous: boolean
  show_next: boolean
  sort_by: string
  next: NextPage
  summary: Record<string, number>
  aggregate_stats: any[]
  total_heart_rate_zone_durations: null
}

interface NextPage {
  workout_id: string
  created_at: number
}

interface FTPInfo {
  ftp: number
  ftp_source: string
  ftp_workout_id: string | null
}

interface AchievementTemplate {
  id: string
  name: string
  slug: string
  image_url: string
  description: string
  animated_image_url: string | null
  kinetic_token_background: string | null
  achievement_count: number
}

interface Workout {
  created_at: number
  device_type: string
  end_time: number
  fitness_discipline: string
  has_pedaling_metrics: boolean
  has_leaderboard_metrics: boolean
  id: string
  is_total_work_personal_record: boolean
  is_outdoor: boolean
  metrics_type: string | null
  name: string
  peloton_id: string
  platform: string
  start_time: number
  status: string
  timezone: string
  title: string | null
  total_work: number
  user_id: string
  workout_type: string
  total_video_watch_time_seconds: number
  total_video_buffering_seconds: number
  v2_total_video_watch_time_seconds: number
  v2_total_video_buffering_seconds: number
  total_music_audio_play_seconds: number | null
  total_music_audio_buffer_seconds: number | null
  service_id: string | null
  ride: Ride
  created: number
  device_time_created_at: number
  strava_id: string | null
  fitbit_id: string | null
  is_skip_intro_available: boolean
  pause_time_remaining: number | null
  pause_time_elapsed: number | null
  is_paused: boolean
  has_paused: boolean
  is_pause_available: boolean
  total_heart_rate_zone_durations: null
  average_effort_score: number | null
  achievement_templates: AchievementTemplate[]
  leaderboard_rank: number
  total_leaderboard_users: number
  ftp_info: FTPInfo
  device_type_display_name: string
}

interface Ride {
  has_closed_captions: boolean
  content_provider: string
  content_format: string
  description: string
  difficulty_rating_avg: number
  difficulty_rating_count: number
  difficulty_level: string | null
  distance: null
  distance_display_value: null
  distance_unit: null
  duration: number
  dynamic_video_recorded_speed_in_mph: number
  extra_images: any[]
  fitness_discipline: string
  fitness_discipline_display_name: string
  has_pedaling_metrics: boolean
  home_peloton_id: string | null
  id: string
  image_url: string
  instructor_id: string
  is_archived: boolean
  is_closed_caption_shown: boolean
  is_dynamic_video_eligible: boolean
  is_explicit: boolean
  is_fixed_distance: boolean
  is_live_in_studio_only: boolean
  language: string
  length: number
  live_stream_id: string
  live_stream_url: null
  location: string
  metrics: string[]
  origin_locale: string
  original_air_time: number
  overall_rating_avg: number
  overall_rating_count: number
  pedaling_start_offset: number
  pedaling_end_offset: number
  pedaling_duration: number
  rating: number
  ride_type_id: string
  ride_type_ids: string[]
  title: string
  total_ratings: number
  total_in_progress_workouts: number
  total_workouts: number
  vod_stream_url: string | null
  vod_stream_id: string
  class_type_ids: string[]
  difficulty_estimate: number
  overall_estimate: number
  availability: {
    is_available: boolean
    reason: null
  }
  explicit_rating: number
  flags: string[]
  instructor: Instructor
}

interface Instructor {
  id: string
  bio: string
  short_bio: string
  coach_type: string
  is_active: boolean
  is_filterable: boolean
  is_instructor_group: boolean
  individual_instructor_ids: any[]
  is_visible: boolean
  is_announced: boolean
  list_order: number
  featured_profile: boolean
  music_bio: string
  spotify_playlist_uri: string
  background: string
  ordered_q_and_as: [string, string][]
  quote: string
  username: string
  name: string
  first_name: string
  last_name: string
  user_id: string
  image_url: string
  instructor_hero_image_url: string
  fitness_disciplines: string[]
  default_cross_fade: number
  default_cue_delay: number
}

interface ArchivedRidesResponse {
  data: ArchivedRide[]
  page: number
  total: number
  count: number
  page_count: number
  show_previous: boolean
  show_next: boolean
  sort_by: string[]
}

interface ArchivedRide {
  id: string
  title: string
  description: string
  duration: number
  content_provider: string
  fitness_discipline: string
  image_url: string
  original_air_time: number
  location: string
  availability: {
    is_available: boolean
    reason: string | null
  }
}

interface Follower {
  id: string
  username: string
  image_url: string
  is_profile_private: boolean
  location: string
  total_followers: number | null
  total_following: number | null
  total_workouts: number | null
  authed_user_follows: boolean
  relationship: {
    me_to_user: string
    user_to_me: string
  }
  category: string
}

interface FollowersResponse {
  data: Follower[]
  limit: number
  page: number
  total: number
  count: number
  page_count: number
  show_previous: boolean
  show_next: boolean
  sort_by: string | null
  next: {
    page: number
  } | null
  total_non_pending_followers: number
}

interface TokenResponse {
  access_token: string
  expires_in: number
  scope: string
  id_token: string
  token_type: string
  refresh_token?: string
}

interface UserDetails {
  id: string
  username: string
  image_url: string
  is_profile_private: boolean
  location: string
  total_followers: number | null
  total_following: number | null
  total_workouts: number | null
  authed_user_follows: boolean
  relationship: {
    me_to_user: string
    user_to_me: string
  }
  category: string
  tags_info: {
    primary_name: string
    primary_tag_background_image_url: string
    total_joined: number
  }
}

export class PelotonAPI {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: Date | null = null
  private lastRequestTime: number = 0
  private readonly minRequestInterval: number = 100 // 100ms between requests

  constructor() {}

  getAccessToken(): string | null {
    return this.accessToken
  }

  private async ensureRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      const delay = this.minRequestInterval - timeSinceLastRequest
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    this.lastRequestTime = Date.now()
  }

  public getRequestOptions(): RequestInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Peloton-Platform": "home_bike",
    }

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    const options: RequestInit = {
      headers,
    }

    return options
  }

  /**
   * Load tokens from the database
   */
  async loadTokensFromDB(): Promise<void> {
    // Get the most recent token record
    const tokenRecords = await db
      .select()
      .from(pelotonOAuthTokensTable)
      .orderBy(desc(pelotonOAuthTokensTable.createdAt))
      .limit(1)

    const record = tokenRecords[0]
    this.accessToken = record.accessToken
    this.refreshToken = record.refreshToken
    this.tokenExpiresAt = new Date(record.expiresAt)
  }

  /**
   * Save tokens to the database
   */
  async saveTokensToDB(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    await db.insert(pelotonOAuthTokensTable).values({
      accessToken,
      refreshToken,
      expiresAt,
    })

    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.tokenExpiresAt = expiresAt
  }

  /**
   * Check if the current access token is expired or about to expire
   */
  private isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) {
      return true
    }
    // Consider token expired if it expires in less than 5 minutes
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    return Date.now() + bufferTime >= this.tokenExpiresAt.getTime()
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available")
    }

    const clientId = process.env["PELOTON_CLIENT_ID"]
    if (!clientId) {
      throw new Error("PELOTON_CLIENT_ID must be set in environment variables")
    }

    const response = await fetch("https://auth.onepeloton.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: this.refreshToken,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to refresh token: ${response.status} - ${errorText}`,
      )
    }

    const data = (await response.json()) as TokenResponse

    if (!data.refresh_token) {
      throw new Error("No refresh token returned from Peloton")
    }

    // Save the new tokens
    await this.saveTokensToDB(
      data.access_token,
      data.refresh_token,
      data.expires_in,
    )
  }

  /**
   * Ensure we have a valid access token, refreshing if necessary
   */
  async ensureValidToken(): Promise<void> {
    // If we don't have tokens in memory, try loading from DB
    if (!this.accessToken) {
      await this.loadTokensFromDB()
    }

    // If token is expired or about to expire, refresh it
    if (this.isTokenExpired()) {
      await this.refreshAccessToken()
    }
  }

  async getWorkouts(
    userId: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<Workout[]> {
    await this.ensureValidToken()

    const allWorkouts: Workout[] = []
    let page = 0
    let hasMore = true
    const limit = 100 // Max allowed by Peloton API

    while (hasMore) {
      let requestUrl = `https://api.onepeloton.com/api/user/${userId}/workouts?joins=ride,ride.instructor&page=${page}&limit=${limit}`

      if (startTime && endTime) {
        requestUrl += `&from=${startTime.toISOString()}&to=${endTime.toISOString()}`
      }

      try {
        const response = await fetch(requestUrl, this.getRequestOptions())

        if (response.status === 401) {
          await this.refreshAccessToken()
          return this.getWorkouts(userId, startTime, endTime)
        }
        if (response.status === 403 || response.status === 404) {
          // Private user, must accept follow to view workouts
          return []
        }
        if (response.status >= 400) {
          console.error(`Failed to fetch workouts: ${response.status}`)
          console.error(await response.text())
          throw new Error(`Failed to fetch workouts: ${response.status}`)
        }
        if (response.status >= 500) {
          console.error(`Peloton API returned ${response.status}.`)
          process.exit(1)
        }

        const data = (await response.json()) as WorkoutResponse
        allWorkouts.push(...data.data)
        hasMore = data.show_next

        page++
      } catch (error) {
        console.error("Failed to fetch workouts:", error)
        throw error
      }
    }

    return allWorkouts
  }

  async getWorkoutPerformanceData(
    workoutId: string,
  ): Promise<PerformanceGraphResponse> {
    await this.ensureValidToken()

    const requestUrl = `https://api.onepeloton.com/api/workout/${workoutId}/performance_graph`

    try {
      const response = await fetch(requestUrl, this.getRequestOptions())

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.getWorkoutPerformanceData(workoutId)
      }
      if (response.status >= 400) {
        console.error(`Failed to fetch performance data: ${response.status}`)
        throw new Error(`Failed to fetch performance data: ${response.status}`)
      }

      const data = (await response.json()) as PerformanceGraphResponse
      return data
    } catch (error) {
      console.error("Failed to fetch workout performance data:", error)
      throw error
    }
  }

  async getWorkout(workoutId: string): Promise<Workout> {
    await this.ensureValidToken()

    const requestUrl = `https://api.onepeloton.com/api/workout/${workoutId}`

    try {
      const response = await fetch(requestUrl, this.getRequestOptions())

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.getWorkout(workoutId)
      }
      if (response.status >= 400) {
        throw new Error(`Failed to fetch workout: ${response.status}`)
      }

      return (await response.json()) as Workout
    } catch (error) {
      console.error("Failed to fetch workout:", error)
      throw error
    }
  }

  async getArchivedRides(
    limit: number = 100,
    page: number = 0,
    duration?: number,
    contentProvider?: string,
  ): Promise<ArchivedRidesResponse> {
    await this.ensureValidToken()

    let requestUrl = `https://api.onepeloton.com/api/v2/ride/archived?limit=${limit}&page=${page}&sort_by=original_air_time&desc=true`

    if (duration) {
      requestUrl += `&duration=${duration}`
    }
    if (contentProvider) {
      requestUrl += `&content_provider=${contentProvider}`
    }

    try {
      const response = await fetch(requestUrl, this.getRequestOptions())

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.getArchivedRides(limit, page, duration, contentProvider)
      }
      if (response.status >= 400) {
        throw new Error(`Failed to fetch archived rides: ${response.status}`)
      }

      return (await response.json()) as ArchivedRidesResponse
    } catch (error) {
      console.error("Failed to fetch archived rides:", error)
      throw error
    }
  }

  async getFollowers(
    userId: string,
    limit: number = 100,
    page: number = 0,
  ): Promise<FollowersResponse> {
    await this.ensureValidToken()
    await this.ensureRateLimit()

    const requestUrl = `https://api.onepeloton.com/api/user/${userId}/followers?limit=${limit}&page=${page}`

    try {
      const response = await fetch(requestUrl, this.getRequestOptions())

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.getFollowers(userId, limit, page)
      }
      if (response.status >= 400) {
        throw new Error(`Failed to fetch followers: ${response.status}`)
      }

      return (await response.json()) as FollowersResponse
    } catch (error) {
      console.error("Failed to fetch followers:", error)
      throw error
    }
  }

  async getAllFollowers(userId: string): Promise<Follower[]> {
    const allFollowers: Follower[] = []
    let page = 0
    let hasMore = true
    const limit = 100 // Max allowed by Peloton API

    while (hasMore) {
      try {
        const data = await this.getFollowers(userId, limit, page)
        allFollowers.push(...data.data)
        hasMore = data.show_next
        page++
      } catch (error) {
        console.error(`Failed to fetch followers page ${page}:`, error)
        throw error
      }
    }

    return allFollowers
  }

  async followUser(userId: string): Promise<boolean> {
    await this.ensureValidToken()
    await this.ensureRateLimit()

    const requestUrl = "https://api.onepeloton.com/api/user/change_relationship"

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getRequestOptions().headers,
        },
        body: JSON.stringify({
          user_id: userId,
          action: "follow",
        }),
      })

      if (response.status === 401) {
        await this.refreshAccessToken()
        // Retry the follow request
        const retryResponse = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.getRequestOptions().headers,
          },
          body: JSON.stringify({
            user_id: userId,
            action: "follow",
          }),
        })

        return retryResponse.ok
      }

      return response.ok
    } catch (error) {
      console.error(`Error following user ${userId}:`, error)
      return false
    }
  }

  async getUserDetails(userId: string): Promise<UserDetails | null> {
    await this.ensureValidToken()
    await this.ensureRateLimit()

    const requestUrl = `https://api.onepeloton.com/api/user/${userId}`

    try {
      const response = await fetch(requestUrl, this.getRequestOptions())

      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.getUserDetails(userId)
      }
      if (response.status === 403 || response.status === 404) {
        // Private user or user not found
        return null
      }
      if (response.status >= 400) {
        console.error(`Failed to fetch user details: ${response.status}`)
        return null
      }

      return (await response.json()) as UserDetails
    } catch (error) {
      console.error(`Failed to fetch user details for ${userId}:`, error)
      return null
    }
  }
}

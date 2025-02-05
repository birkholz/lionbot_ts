import { getUserRides, getUserStatsWithAvatars } from "@services/leaderboard"
import { cache } from "react"

export const getCachedUserStats = cache(getUserStatsWithAvatars)
export const getCachedUserRides = cache(getUserRides)

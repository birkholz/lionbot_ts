import { computeUserStats } from "@services/leaderboard"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const stats = await computeUserStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to compute user stats:", error)
    return NextResponse.json([], { status: 500 })
  }
}

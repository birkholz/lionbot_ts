import { TZDate } from "@date-fns/tz"
import { db } from "@db/client"
import { cyclistsTable, leaderboardsTable } from "@db/schema"
import { PelotonAPI } from "@lib/peloton"
import {
  formatNumber,
  getInstructorName,
  hasNoDuration,
  humanize,
  isWithinInterval,
  pbListStr,
  rideCountStr,
  sendDiscordRequest,
  validWorkout,
  withRetry,
} from "@lib/utils"
import type { DiscordEmbed, PBInfo, UserTotal } from "@types"
import { RideInfo, WorkoutInfo } from "@types"
import { addDays, format, set, subDays, subHours } from "date-fns"
import { sql } from "drizzle-orm"
import { mean, median } from "mathjs"
import pMap from "p-map"
import pluralize from "pluralize"

export async function postWorkouts(
  api: PelotonAPI,
  nlUserId: string,
): Promise<void> {
  const workouts = await api.getWorkouts(nlUserId)
  const intervalMs = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const recentWorkouts = workouts.filter((workout) =>
    isWithinInterval(workout.created_at, intervalMs),
  )

  const embeds: DiscordEmbed[] = []

  for (const workout of recentWorkouts) {
    if (workout.status !== "COMPLETE" || workout.metrics_type !== "cycling") {
      continue
    }
    const fullWorkout = await withRetry(() => api.getWorkout(workout.id))

    const classId = workout.ride.id
    const classUrl = `https://members.onepeloton.com/classes/cycling?modal=classDetailsModal&classId=${classId}`

    const createdAt = new Date(workout.created_at * 1000)
    const totalOutput = workout.total_work
    if (hasNoDuration(workout)) {
      continue
    }

    const avgOutput = Math.round(
      totalOutput / (workout.end_time - workout.start_time),
    )

    const instructorName =
      workout.ride.instructor?.name ?? workout.ride.description
    const instructorImage =
      workout.ride.instructor?.image_url ?? workout.ride.image_url
    const rideTitle = workout.ride.title

    const newPb = fullWorkout.achievement_templates.some(
      (a) => a.slug === "best_output",
    )
    const pbLine = newPb ? "\n\n ⭐ ️**New PB!** ⭐ " : ""

    const embed: DiscordEmbed = {
      type: "rich",
      title: rideTitle,
      description: `${instructorName}${pbLine}`,
      url: classUrl,
      thumbnail: {
        url: instructorImage,
      },
      fields: [
        {
          name: "Date",
          value: `<t:${Math.floor(createdAt.getTime() / 1000)}:F>`,
          inline: true,
        },
        {
          name: "Total Output",
          value: `${Math.round(totalOutput / 1000)} kJ`,
          inline: true,
        },
        {
          name: "Avg Output",
          value: `${Math.round(avgOutput)} W`,
          inline: true,
        },
      ],
    }

    embeds.push(embed)
  }

  if (embeds.length === 0) {
    return
  }

  const jsonBody = {
    content: "Northernlion finished a workout",
    embeds: embeds.reverse(),
    allowed_mentions: {
      parse: ["roles"],
    },
  }

  const channelId = process.env["PELOTON_CHANNEL_ID"]

  await sendDiscordRequest("post", `channels/${channelId}/messages`, jsonBody)
  console.info(
    `Successfully posted Peloton ride ids: ${recentWorkouts.map((workout) => workout.ride.id)}`,
  )
}

export async function postLeaderboard(
  api: PelotonAPI,
  nlUserId: string,
  postEmbeds: boolean,
  dateStr: string,
): Promise<void> {
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error("Date must be in YYYY-MM-DD format")
  }

  const targetDate = new Date(dateStr)
  // Check if date is valid
  if (isNaN(targetDate.getTime())) {
    throw new Error("Invalid date provided")
  }

  const [year, month, day] = dateStr.split("-").map(Number) as [
    number,
    number,
    number,
  ]
  const date = new TZDate(year, month - 1, day, "America/Los_Angeles")
  const startDt = set(date, {
    hours: 6,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  const dayStart = set(date, {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  const dayEnd = addDays(dayStart, 1)
  const minDt = subHours(startDt, 12)
  const streamStart = set(addDays(minDt, 2), {
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })

  const nlWorkouts = await withRetry(() =>
    api.getWorkouts(nlUserId, dayStart, dayEnd),
  )
  const validNLWorkouts = nlWorkouts
    .filter(validWorkout)
    .filter(
      (workout) => workout.ride?.id !== "00000000000000000000000000000000",
    )

  let rides: Record<string, RideInfo> = {}
  const rideParticipationCount: Record<string, Set<string>> = {}
  const rideDetails: Record<
    string,
    { title: string; instructor: string; image_url: string; start_time: number }
  > = {}

  // Initialize rides from NL's workouts if they exist
  for (const workout of validNLWorkouts) {
    if (!workout.ride?.id || !workout.ride?.title) continue
    const ride = new RideInfo(
      workout.ride.id,
      workout.ride.title,
      getInstructorName(workout),
      workout.start_time,
      `https://members.onepeloton.com/classes/cycling?modal=classDetailsModal&classId=${workout.ride.id}`,
      workout.ride.image_url,
    )
    rides[workout.ride.id] = ride
  }

  const totals: Record<string, UserTotal> = {}
  const playersWhoPbd: Record<string, PBInfo[]> = {}

  const users = await db
    .select({
      user_id: cyclistsTable.user_id,
      username: cyclistsTable.username,
    })
    .from(cyclistsTable)

  await pMap(
    users,
    async (user) => {
      const userWorkouts = await withRetry(() =>
        api.getWorkouts(user.user_id, minDt, streamStart),
      )
      const validUserWorkouts = userWorkouts.filter(validWorkout)

      for (const workout of validUserWorkouts) {
        const workoutRideId = workout.ride.id
        let shouldTrackInLeaderboard = false

        // Determine if this workout should be tracked in ride leaderboards
        if (workoutRideId !== "00000000000000000000000000000000") {
          if (validNLWorkouts.length > 0) {
            const ride = rides[workoutRideId]
            shouldTrackInLeaderboard = !!ride
          } else {
            shouldTrackInLeaderboard = true
          }

          // Track participation count for each ride that could be in leaderboards
          if (shouldTrackInLeaderboard) {
            if (!rideParticipationCount[workoutRideId]) {
              rideParticipationCount[workoutRideId] = new Set()
            }
            rideParticipationCount[workoutRideId].add(user.username)
            if (!rideDetails[workoutRideId]) {
              rideDetails[workoutRideId] = {
                title: workout.ride.title,
                instructor: getInstructorName(workout),
                image_url: workout.ride.image_url,
                start_time: workout.start_time,
              }
            }
          }
        }

        const workoutTime = new TZDate(
          workout.start_time * 1000,
          workout.timezone,
        )
        const workoutDateStr = format(workoutTime, "yyyy-MM-dd")

        // If this workout's date matches our target date, process it for PBs and totals
        if (workoutDateStr === dateStr) {
          const userWorkout = await withRetry(() => api.getWorkout(workout.id))
          const isPb = userWorkout.achievement_templates.some(
            (a) => a.slug === "best_output",
          )
          // Did user PB?
          if (isPb) {
            const pbDict: PBInfo = {
              total_work: workout.total_work,
              duration: Math.round(
                (workout.end_time - workout.start_time) / 60,
              ),
            }
            const existingPbs = playersWhoPbd[user.username]
            if (existingPbs) {
              existingPbs.push(pbDict)
            } else {
              playersWhoPbd[user.username] = [pbDict]
            }
          }

          // Calculate user's totals
          const userTotal = totals[user.username]
          if (!userTotal) {
            totals[user.username] = {
              username: user.username,
              output: workout.total_work,
              rides: 1,
              duration: Math.round(
                (workout.end_time - workout.start_time) / 60,
              ),
            }
          } else {
            userTotal.output += workout.total_work
            userTotal.rides += 1
            userTotal.duration += Math.round(
              (workout.end_time - workout.start_time) / 60,
            )
          }
        }

        // was ride recent?
        // Leaderboard rides can be up to 12 hours before NL until stream start the following day
        const workoutDate = new TZDate(
          workout.start_time * 1000,
          workout.timezone,
        )
        if (workoutDate < minDt || workoutDate > dayEnd) continue

        // Only add to ride leaderboards if it should be tracked
        if (shouldTrackInLeaderboard) {
          let ride = rides[workoutRideId]

          // If we don't have NL's rides, add all rides to the tracking
          if (validNLWorkouts.length === 0) {
            if (!ride) {
              const details = rideDetails[workoutRideId]
              if (details) {
                ride = new RideInfo(
                  workoutRideId,
                  details.title,
                  details.instructor,
                  details.start_time,
                  `https://members.onepeloton.com/classes/cycling?modal=classDetailsModal&classId=${workoutRideId}`,
                  details.image_url,
                )
                rides[workoutRideId] = ride
              }
            }
          }
          if (ride) {
            const performanceData = await withRetry(() =>
              api.getWorkoutPerformanceData(workout.id),
            )
            const avgCadence =
              performanceData.average_summaries.find(
                (m) => m.slug === "avg_cadence",
              )?.value ?? 0
            const avgResistance =
              performanceData.average_summaries.find(
                (m) => m.slug === "avg_resistance",
              )?.value ?? 0
            const distance =
              performanceData.summaries.find((m) => m.slug === "distance")
                ?.value ?? 0
            // performanceData.duration is wrong, it is the ride's duration, not the workout's
            const duration = workout.end_time - workout.start_time
            const workoutObj = new WorkoutInfo(
              user.username,
              workout.total_work,
              workout.is_total_work_personal_record,
              avgCadence,
              avgResistance,
              distance,
              duration,
              performanceData.effort_zones,
            )
            ride.workouts.push(workoutObj)
          }
        }
      }
    },
    { concurrency: 15 },
  )

  // Filter out rides with less than 10 riders
  rides = Object.fromEntries(
    Object.entries(rides).filter(
      ([_, ride]) =>
        ride.id in validNLWorkouts.map((w) => w.ride.id) ||
        ride.workouts.length >= 10,
    ),
  )

  // Dump all the rides to the db
  const ridesJson: typeof leaderboardsTable.$inferInsert = {
    json: { totals, playersWhoPbd, rides: rides },
    date: dateStr,
  }
  await db.insert(leaderboardsTable).values(ridesJson)

  // Track which users we've seen to avoid double counting rides
  const usersToUpdate: Array<{
    username: string
    highest_output: number
  }> = []

  // Process all users who participated in rides, checking for PBs
  for (const ride of Object.values(rides)) {
    for (const workout of ride.workouts) {
      const username = workout.user_username
      if (usersToUpdate.some((u) => u.username === username)) {
        continue
      }

      // Get the highest output from any PBs this user achieved today
      const userPbs = playersWhoPbd[username] || []
      const highestPbOutput =
        userPbs.length > 0
          ? Math.round(Math.max(...userPbs.map((pb) => pb.total_work)))
          : 0

      usersToUpdate.push({
        username,
        highest_output: highestPbOutput,
      })
    }
  }

  // Process any users who got PBs but didn't participate in leaderboard rides
  for (const [username, userPbs] of Object.entries(playersWhoPbd)) {
    if (usersToUpdate.some((u) => u.username === username)) {
      continue
    }
    const highestPbOutput = Math.round(
      Math.max(...userPbs.map((pb) => pb.total_work)),
    )

    usersToUpdate.push({
      username,
      highest_output: highestPbOutput,
    })
  }

  // Perform a single bulk insert/update for all users
  if (usersToUpdate.length > 0) {
    await db
      .insert(cyclistsTable)
      .values(
        usersToUpdate.map((user) => ({
          username: user.username,
          user_id: "", // This will be filled by fetch-avatars.ts
          avatar_url: "", // This will be filled by fetch-avatars.ts
          first_ride: dateStr,
          total_rides: 1,
          highest_output: user.highest_output,
        })),
      )
      .onConflictDoUpdate({
        target: cyclistsTable.username,
        set: {
          total_rides: sql`COALESCE(${cyclistsTable.total_rides}, 0) + 1`,
          highest_output: sql`CASE
            WHEN EXCLUDED.highest_output > 0 THEN GREATEST(COALESCE(${cyclistsTable.highest_output}, 0), EXCLUDED.highest_output)
            ELSE COALESCE(${cyclistsTable.highest_output}, 0)
          END`,
          first_ride: sql`CASE
            WHEN ${cyclistsTable.first_ride} IS NULL THEN ${dateStr}
            ELSE ${cyclistsTable.first_ride}
          END`,
        },
      })
  }

  if (!postEmbeds) {
    return
  }

  const embeds: DiscordEmbed[] = []
  const leaderboardSize = Number(process.env["LEADERBOARD_SIZE"]) || 10

  // Generate leaderboards
  for (const ride of Object.values(rides)) {
    ride.workouts = ride.sortedWorkouts()
    const medianOutput = ride.getMedianOutput()
    const meanOutput = ride.getMeanOutput()
    const riderCount = ride.workouts.length
    // cut top
    ride.workouts = ride.workouts.slice(0, leaderboardSize)

    const embed: DiscordEmbed = {
      type: "rich",
      title: `${ride.title} - Leaderboard`,
      description: `${ride.instructor_name}\rTotal riders: **${riderCount}**`,
      url: `https://www.theeggcarton.bike/archive/${dateStr}`,
      thumbnail: { url: ride.image_url },
      fields: ride.workouts.map((workout, i) => ({
        name: `${humanize(i)} Place`,
        value:
          `${workout.getOutputString()}${workout.getPBString()}` +
          ` ${rideCountStr(totals, workout)}`,
        inline: false,
      })),
    }

    embed.fields.push({
      name: "Median / Average",
      value: `**${Math.round(medianOutput / 1000)}** kJ / **${Math.round(meanOutput / 1000)}** kJ`,
      inline: false,
    })

    embeds.push(embed)
  }

  // Generate endurance leaderboard
  if (Object.keys(totals).length > 0) {
    const totalsList = Object.values(totals).sort((a, b) => b.output - a.output)
    const totalRiders = totalsList.length
    const rideCounts = totalsList.map((w) => w.rides)
    const medianRideCount = Number(median(rideCounts))
    const averageRideCount = Number(mean(rideCounts))
    const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0)
    const topTotals = totalsList.slice(0, leaderboardSize)

    const totalOutputStr =
      totalOutput / 1000000 > 10
        ? `**${Math.round((totalOutput / 1000000) * 100) / 100}** MJ`
        : `**${Math.round(totalOutput / 1000)}** kJ`

    const embed: DiscordEmbed = {
      type: "rich",
      title: `Endurance Leaderboard ${dateStr}`,
      description:
        `Combined output from all of #TheEggCarton's rides.\r` +
        `Total riders: **${totalRiders}**\r` +
        `Median/Average ride count: **${formatNumber(medianRideCount)}** / **${formatNumber(averageRideCount)}**\r` +
        `Combined Output: ${totalOutputStr}`,
      url: "",
      thumbnail: { url: "" },
      fields: topTotals.map((user, i) => ({
        name: `${humanize(i)} Place`,
        value:
          `${user.username} - **${Math.round(user.output / 1000)}** kJ (${user.rides} ` +
          `${pluralize("ride", user.rides)} / ${user.duration} mins)`,
        inline: false,
      })),
    }

    embeds.push(embed)
  }

  // Generate PB callout
  if (Object.keys(playersWhoPbd).length > 0) {
    const playerCallouts = Object.entries(playersWhoPbd)
      .map(([un, uDict]) => `${un} (${pbListStr(uDict)})`)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

    let desc = playerCallouts.join(", ")
    // Escape double underscore
    desc = desc.replace(/__/g, "\\_\\_")

    const embed: DiscordEmbed = {
      type: "rich",
      title: "⭐ Congratulations for the new PBs! ⭐",
      description: desc,
      url: "",
      thumbnail: { url: "" },
      fields: [],
    }

    embeds.push(embed)
  }

  if (embeds.length === 0) {
    return
  }

  const jsonBody = {
    content:
      `# \\#TheEggCarton Leaderboards - ${dateStr}\n` +
      `To see the full leaderboards, visit [theeggcarton.bike/archive/${dateStr}](https://www.theeggcarton.bike/archive/${dateStr})\n` +
      "Ride leaderboards are generated for any ride with 10+ riders or that NL participated in.\n" +
      "Endurance leaderboards and the PB callout include all rides on the given date in your timezone.\n" +
      "See https://discord.com/channels/726598830992261273/1157338211480256573/1172736947526045716 " +
      "for more info.",
    embeds,
    allowed_mentions: {
      parse: ["roles"],
    },
  }

  const channelId = process.env["PELOTON_CHANNEL_ID"]

  await sendDiscordRequest("post", `channels/${channelId}/messages`, jsonBody)
  console.info(
    `Successfully posted leaderboard with ride ids: ${Object.keys(rides)}`,
  )
}

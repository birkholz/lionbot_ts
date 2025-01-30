import * as Sentry from "@sentry/bun"
import { format, subDays, subHours } from "date-fns"
import { mean, median } from "mathjs"
import pMap from "p-map"
import pluralize from "pluralize"
import { db } from "./db/client"
import { leaderboardsTable } from "./db/schema"
import "./instrument"
import { PelotonAPI } from "./peloton"
import {
  formatNumber,
  getInstructorName,
  hasNoDuration,
  humanize,
  isPreviousDay,
  isWithinInterval,
  pbListStr,
  rideCountStr,
  rideDurationOrActual,
  RideInfo,
  sendDiscordRequest,
  validWorkout,
  WorkoutInfo,
  type DiscordEmbed,
  type PBInfo,
  type UserTotal,
} from "./utils"

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

    const classId = workout.ride.id
    const classUrl = `https://members.onepeloton.com/classes/cycling?modal=classDetailsModal&classId=${classId}`

    const createdAt = new Date(workout.created_at * 1000)
    const totalOutput = workout.total_work
    if (hasNoDuration(workout)) {
      continue
    }

    const avgOutput = Math.round(totalOutput / rideDurationOrActual(workout))

    const instructorName =
      workout.ride.instructor?.name ?? workout.ride.description
    const instructorImage =
      workout.ride.instructor?.image_url ?? workout.ride.image_url
    const rideTitle = workout.ride.title

    const newPb = workout.is_total_work_personal_record
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
  try {
    await sendDiscordRequest("post", `channels/${channelId}/messages`, jsonBody)
    console.info(
      `Successfully posted Peloton ride ids: ${recentWorkouts.map((workout) => workout.ride.id)}`,
    )
  } catch (error) {
    Sentry.captureException(error)
  }
}

export async function postLeaderboard(
  api: PelotonAPI,
  nlUserId: string,
): Promise<void> {
  const workouts = await api.getWorkouts(nlUserId)
  const recentWorkouts = workouts.filter((workout) => isPreviousDay(workout))
  const validWorkouts = recentWorkouts.filter(validWorkout).reverse()

  const rides: Record<string, RideInfo> = {}
  for (const workout of validWorkouts) {
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

  const { users } = await api.getUsersInTag("TheEggCarton")

  await pMap(
    users,
    async (user) => {
      const userWorkouts = await api.getWorkouts(user.id)
      const validUserWorkouts = userWorkouts.filter(validWorkout)

      for (const workout of validUserWorkouts) {
        const workoutRideId = workout.ride.id

        if (isPreviousDay(workout)) {
          // Did user PB?
          if (workout.is_total_work_personal_record) {
            const pbDict: PBInfo = {
              total_work: workout.total_work,
              duration: Math.round(rideDurationOrActual(workout) / 60),
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
              duration: Math.round(rideDurationOrActual(workout) / 60),
            }
          } else {
            userTotal.output += workout.total_work
            userTotal.rides += 1
            userTotal.duration += Math.round(rideDurationOrActual(workout) / 60)
          }
        }

        // Add workout to ride leaderboard
        const ride = rides[workoutRideId]
        if (!ride) continue

        // was ride recent?
        // These rides can be up to 12 hours before NL
        const startTime = new Date(workout.start_time * 1000)
        const minDt = subHours(new Date(ride.start_time * 1000), 12)
        if (startTime < minDt) continue

        const performanceData = await api.getWorkoutPerformanceData(workout.id)
        const avgCadence =
          performanceData.metrics.find((m) => m.slug === "cadence")
            ?.average_value ?? 0
        const avgResistance =
          performanceData.metrics.find((m) => m.slug === "resistance")
            ?.average_value ?? 0
        const striveScore = performanceData.effort_zones?.total_effort_points
        const workoutObj = new WorkoutInfo(
          user.username,
          workout.total_work,
          workout.is_total_work_personal_record,
          avgCadence,
          avgResistance,
          striveScore,
        )
        ride.workouts.push(workoutObj)
      }
    },
    { concurrency: 10 },
  )

  const yesterday = subDays(new Date(), 1)
  // Dump all the rides to the db
  const ridesJson: typeof leaderboardsTable.$inferInsert = {
    json: { rides, totals, playersWhoPbd },
    date: format(yesterday, "yyyy-MM-dd"),
  }
  await db.insert(leaderboardsTable).values(ridesJson)

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
      description: `Instructor: ${ride.instructor_name}\rNL rode: <t:${ride.start_time}:F>\rTotal riders: **${riderCount}**`,
      url: ride.url,
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
    const medianRideCount = median(rideCounts)
    const averageRideCount = mean(rideCounts)
    const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0)
    const topTotals = totalsList.slice(0, leaderboardSize)

    const totalOutputStr =
      totalOutput / 1000000 > 10
        ? `**${Math.round((totalOutput / 1000000) * 100) / 100}** MJ`
        : `**${Math.round(totalOutput / 1000)}** kJ`

    const embed: DiscordEmbed = {
      type: "rich",
      title: `Endurance Leaderboard ${yesterday.toISOString().split("T")[0]}`,
      description:
        `Combined output across all of yesterday's rides.\r` +
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
      "# \\#TheEggCarton Leaderboards\n" +
      "Ride leaderboards are for NL's rides yesterday " +
      "and include all matching rides from 12 hours before the ride until now.\n" +
      "Endurance leaderboards and the PB callout are only yesterday's rides (in your timezone).\n" +
      "See https://discord.com/channels/726598830992261273/1157338211480256573/1172736947526045716 " +
      "for more info.",
    embeds,
    allowed_mentions: {
      parse: ["roles"],
    },
  }

  const channelId = process.env["PELOTON_CHANNEL_ID"]
  try {
    await sendDiscordRequest("post", `channels/${channelId}/messages`, jsonBody)
    console.info(
      `Successfully posted leaderboard with ride ids: ${Object.keys(rides)}`,
    )
  } catch (error) {
    Sentry.captureException(error)
  }
}

async function getAndPostWorkouts(): Promise<void> {
  // Scheduler calls this every interval
  const api = new PelotonAPI()
  await api.login()

  const nlUserId = "efc2317a6aad48218488a27bf8b0e460"
  await postWorkouts(api, nlUserId)

  const leaderboardUserId =
    process.env["LEADERBOARD_USER_ID"] ?? "efc2317a6aad48218488a27bf8b0e460"
  await postLeaderboard(api, leaderboardUserId)
}

getAndPostWorkouts()

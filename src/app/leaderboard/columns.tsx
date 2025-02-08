"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserAvatar } from "@components/user-avatar"
import { ChartContainer } from "@components/ui/chart"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { Sparkle } from "lucide-react"
import { PieChart, Pie } from "recharts"
import Link from "next/link"
import { getAvatarUrl, localizeNumber } from "@lib/utils"

interface RideWorkout {
  user_username: string
  total_work: number
  is_new_pb: boolean
  distance: number | null
  duration: number
  effort_zones?: {
    total_effort_points: number
    heart_rate_zone_durations: Record<string, number>
  }
}

const chartConfig = {
  "1": {
    label: "Zone 1",
    color: "#50C4AA",
  },
  "2": {
    label: "Zone 2",
    color: "#B6C95C",
  },
  "3": {
    label: "Zone 3",
    color: "#FACB3E",
  },
  "4": {
    label: "Zone 4",
    color: "#FC800F",
  },
  "5": {
    label: "Zone 5",
    color: "#FF4759",
  },
}

function formatDistance(
  distance: number | null,
  useMetric: boolean,
  locale: string,
) {
  if (!distance) return "-"
  if (useMetric) {
    return (
      <>
        {localizeNumber(distance, locale)}
        <span className="text-muted-foreground"> km</span>
      </>
    )
  }
  return (
    <>
      {localizeNumber(distance * 0.621371, locale)}
      <span className="text-muted-foreground"> mi</span>
    </>
  )
}

export const rideColumns = (
  avatars: Array<{ username: string; avatar_url: string }>,
  useMetric: boolean,
  locale: string,
): ColumnDef<RideWorkout>[] => [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "user_username",
    header: "Username",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserAvatar
          avatar_url={getAvatarUrl(row.original.user_username, avatars)}
          width={21}
          height={21}
        />
        <Link
          className="text-primary hover:text-primary/80 hover:underline"
          href={`/cyclist/${row.original.user_username}`}
        >
          {row.original.user_username}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "total_work",
    header: "Total Output",
    cell: ({ row }) => (
      <>
        {localizeNumber(Math.round(row.original.total_work / 1000), locale)}
        <span className="text-muted-foreground"> kJ </span>
        {row.original.is_new_pb && (
          <Tooltip>
            <TooltipTrigger className="inline-block h-[1em] cursor-default align-middle">
              <Sparkle width="1em" height="1em" color="gold" />
            </TooltipTrigger>
            <TooltipContent>
              <p>New PB</p>
            </TooltipContent>
          </Tooltip>
        )}
      </>
    ),
  },
  {
    accessorKey: "distance",
    header: "Distance",
    cell: ({ row }) => formatDistance(row.original.distance, useMetric, locale),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <>
        {Math.round(row.original.duration / 60)}
        <span className="text-muted-foreground"> mins</span>
      </>
    ),
  },
  {
    accessorKey: "effort_zones",
    header: () => (
      <a
        href="https://www.onepeloton.com/blog/strive-score/"
        target="_blank"
        className="cursor-help hover:text-foreground hover:underline"
      >
        Strive Score
      </a>
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const zones = row.original.effort_zones
      if (!zones?.total_effort_points) {
        return <span className="text-muted-foreground">-</span>
      }
      return (
        <div className="min-w-[6em] md:text-left">
          {localizeNumber(zones.total_effort_points, locale)}
          <ChartContainer
            config={chartConfig}
            className="float-left mr-1 inline-block h-[20px] w-[20px]"
          >
            <PieChart>
              <Pie
                data={Object.entries(zones.heart_rate_zone_durations)
                  .reverse()
                  .map(([key, value], i) => ({
                    name: key,
                    value,
                    fill: `var(--color-${5 - i})`,
                  }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={6}
                outerRadius={10}
                startAngle={90}
                endAngle={450}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
        </div>
      )
    },
  },
]

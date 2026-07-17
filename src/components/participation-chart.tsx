"use client"

import { format, parseISO, startOfWeek } from "date-fns"
import type React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart"
import { ParticipationData } from "@services/leaderboard"

interface WeeklyParticipationChartProps {
  data: ParticipationData[]
}

export function WeeklyParticipationChart({
  data,
}: WeeklyParticipationChartProps): React.ReactElement {
  // Group data by week
  const weeklyData = data.reduce<{ date: string; participants: number }[]>(
    (acc, day) => {
      const weekStart = format(
        startOfWeek(parseISO(day.date), { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      )

      const existingWeek = acc.find((d) => d.date === weekStart)
      if (existingWeek) {
        existingWeek.participants = Math.max(
          existingWeek.participants,
          day.participants,
        )
      } else {
        acc.push({
          date: weekStart,
          participants: day.participants,
        })
      }
      return acc
    },
    [],
  )

  // Sort by date
  weeklyData.sort((a, b) => a.date.localeCompare(b.date))

  const formatDate = (date: string): string => format(parseISO(date), "MM/dd")
  const formatTooltipDate = (date: string): string =>
    `Week of ${format(parseISO(date), "MM/dd")}`

  return (
    <ChartContainer
      config={{
        participants: {
          label: "Participants",
          color: "hsl(var(--primary))",
        },
      }}
      className="my-2 mr-4 md:mr-6"
    >
      <AreaChart accessibilityLayer data={weeklyData} width={600} height={300}>
        <CartesianGrid horizontal={false} vertical={false} />
        <XAxis
          dataKey="date"
          angle={-45}
          minTickGap={10}
          tickFormatter={formatDate}
          label={{
            value: "Week",
            position: "insideBottom",
          }}
          height={50}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={5}
          dataKey="participants"
          label={{
            value: "Participants",
            position: "insideLeft",
            angle: -90,
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
          labelFormatter={formatTooltipDate}
        />
        <Area
          dataKey="participants"
          type="natural"
          fill="hsl(var(--primary))"
          fillOpacity={0.4}
          stroke="hsl(var(--primary))"
        />
      </AreaChart>
    </ChartContainer>
  )
}

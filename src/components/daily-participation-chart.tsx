"use client"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart"
import { ParticipationData } from "@services/leaderboard"
import { format, parseISO, subMonths } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface DailyParticipationChartProps {
  data: ParticipationData[]
}

export function DailyParticipationChart({
  data,
}: DailyParticipationChartProps) {
  const twoMonthsAgo = subMonths(new Date(), 2)
  const recentData = data.filter((d) => parseISO(d.date) >= twoMonthsAgo)

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
      <AreaChart accessibilityLayer data={recentData} width={600} height={300}>
        <CartesianGrid horizontal={false} vertical={false} />
        <XAxis
          dataKey="date"
          angle={-45}
          minTickGap={10}
          textAnchor="end"
          height={60}
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

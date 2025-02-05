"use client"

import { ChartTooltip } from "@components/ui/chart"
import { ChartTooltipContent } from "@components/ui/chart"
import { ChartContainer } from "@components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import type { UserStats } from "@services/leaderboard"
import { startOfWeek, format } from "date-fns"

interface Props {
  users: UserStats[]
}

export function UsersChart({ users }: Props) {
  // Group users by week and count them
  const data = users.reduce<{ date: string; count: number }[]>((acc, user) => {
    // Get the start of the week for this user's first ride
    const weekStart = format(
      startOfWeek(new Date(user.firstRide), { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    )

    const existingWeek = acc.find((d) => d.date === weekStart)
    if (existingWeek) {
      existingWeek.count++
    } else {
      acc.push({
        date: weekStart,
        count: 1,
      })
    }
    return acc
  }, [])

  // Sort by date
  data.sort((a, b) => a.date.localeCompare(b.date))

  const formatDate = (date: string) => format(new Date(date), "MM/dd")
  const formatTooltipDate = (date: string) =>
    `Week of ${format(new Date(date), "MM/dd")}`

  return (
    <ChartContainer
      config={{
        count: {
          label: "New Riders",
          color: "hsl(var(--primary))",
        },
      }}
      className="my-2 mr-4 md:mr-6"
    >
      <AreaChart accessibilityLayer data={data} width={600} height={300}>
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
          dataKey="count"
          label={{
            value: "New Riders",
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
          dataKey="count"
          type="natural"
          fill="hsl(var(--primary))"
          fillOpacity={0.4}
          stroke="hsl(var(--primary))"
        />
      </AreaChart>
    </ChartContainer>
  )
}

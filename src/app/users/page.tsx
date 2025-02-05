import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { UserAvatar } from "@components/user-avatar"
import { CyclistsChart } from "@components/cyclists-chart"
import { getUserStatsWithAvatars } from "@services/leaderboard"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "#TheEggCarton Users",
}

function formatRate(rate?: number): string {
  if (!rate) return "-"
  const watts = rate * (1000 / 60) // Convert kJ/min to watts
  if (watts >= 1000) {
    return `${(watts / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `
  }
  return `${Math.round(watts).toLocaleString()} `
}

function formatOutput(output?: number): string {
  if (!output || !isFinite(output)) return "-"
  if (output >= 1000) {
    return `${(output / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `
  }
  return `${Math.round(output).toLocaleString()} `
}

function getWattageUnit(rate: number): string {
  const watts = rate * (1000 / 60)
  return watts >= 1000 ? "MW" : "W"
}

function getOutputUnit(output: number): string {
  return output >= 1000 ? "MJ" : "kJ"
}

export default async function Users() {
  const userStats = await getUserStatsWithAvatars()

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        <span className="text-primary">{userStats.length}</span> Cyclists
      </h1>
      <CyclistsChart users={userStats} />
      <p className="mx-4 mb-2 text-left text-sm text-muted-foreground">
        This is a list of all the cyclists who have joined any of the group
        rides since the leaderboards started on{" "}
        <Link
          href="/archive/2023-09-22"
          className="text-primary hover:text-primary/80 hover:underline"
        >
          2023-09-22
        </Link>
        .
      </p>
      <p className="mx-4 mb-2 text-left text-sm text-muted-foreground">
        Total Rides only counts group rides, while Highest Wattage and Highest
        Output are based on all rides since the start of the leaderboards.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>First Ride</TableHead>
            <TableHead>Total Rides</TableHead>
            <TableHead>Highest Wattage</TableHead>
            <TableHead>Highest Output</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap">
          {userStats.map((user) => (
            <TableRow key={user.username}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.avatar_url && (
                    <UserAvatar
                      avatar_url={user.avatar_url}
                      width={21}
                      height={21}
                    />
                  )}
                  <a
                    href={`https://members.onepeloton.com/members/${user.username}/overview`}
                    target="_blank"
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {user.username}
                  </a>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/archive/${user.firstRide}`}
                  className="text-primary hover:text-primary/80 hover:underline"
                >
                  {user.firstRide}
                </Link>
              </TableCell>
              <TableCell>
                {user.totalRides}
                <span className="text-muted-foreground"> rides</span>
              </TableCell>
              <TableCell>
                {formatRate(user.highestPbRate)}
                <span className="text-muted-foreground">
                  {user.highestPbRate && getWattageUnit(user.highestPbRate)}
                </span>
              </TableCell>
              <TableCell>
                {formatOutput(user.highestOutput)}
                <span className="text-muted-foreground">
                  {user.highestOutput && getOutputUnit(user.highestOutput)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

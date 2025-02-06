import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { UserAvatar } from "@components/user-avatar"
import { getUserStats } from "@services/leaderboard"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "#TheEggCarton Cyclists",
  description: "The recognized members of #TheEggCarton",
}

function formatOutput(output?: number): string {
  if (!output || !isFinite(output)) return "-"
  if (output >= 1000) {
    return `${(output / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} `
  }
  return `${Math.round(output).toLocaleString()} `
}

function getOutputUnit(output: number): string {
  return output >= 1000 ? "MJ" : "kJ"
}

export default async function Cyclists() {
  const userStats = await getUserStats()

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        <span className="text-primary">{userStats.length}</span> Cyclists
      </h1>
      <p className="mx-4 mb-6 text-center">
        View{" "}
        <Link
          href="/cyclists/charts"
          className="text-primary hover:text-primary/80 hover:underline"
        >
          cyclist growth and participation charts
        </Link>
      </p>
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
        Total Rides only counts group rides, while Highest Output is based on
        all rides since the start of the leaderboards.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>First Ride</TableHead>
            <TableHead>Total Rides</TableHead>
            <TableHead>Highest Output</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap">
          {userStats.map((user) => (
            <TableRow key={user.username}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserAvatar
                    avatar_url={
                      user.avatar_url ??
                      `https://placehold.co/21x21/red/red.webp`
                    }
                    width={21}
                    height={21}
                  />
                  <Link
                    href={`/cyclist/${user.username}`}
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {user.username}
                  </Link>
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

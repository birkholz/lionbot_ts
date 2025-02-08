"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserAvatar } from "@components/user-avatar"
import Link from "next/link"
import type { UserStats } from "@services/leaderboard"

function formatOutput(output?: number): string {
  if (
    output === undefined ||
    output === null ||
    !isFinite(output) ||
    output === 0
  )
    return "-"
  if (output >= 1000) {
    return `${(output / 1000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
  return `${Math.round(output).toLocaleString()}`
}

function formatOutputUnit(output?: number) {
  if (
    output === undefined ||
    output === null ||
    !isFinite(output) ||
    output === 0
  )
    return ""
  return output >= 1000 ? " MJ" : " kJ"
}

export const columns: ColumnDef<UserStats>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <UserAvatar
            avatar_url={
              user.avatar_url ?? `https://placehold.co/21x21/red/red.webp`
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
      )
    },
  },
  {
    accessorKey: "firstRide",
    header: "First Ride",
    cell: ({ row }) => (
      <Link
        href={`/archive/${row.original.firstRide}`}
        className="text-primary hover:text-primary/80 hover:underline"
      >
        {row.original.firstRide}
      </Link>
    ),
  },
  {
    accessorKey: "totalRides",
    header: "Total Rides",
    cell: ({ row }) => (
      <>
        {row.original.totalRides}
        <span className="text-muted-foreground"> rides</span>
      </>
    ),
  },
  {
    accessorKey: "highestOutput",
    header: "Highest Output",
    cell: ({ row }) => (
      <>
        {formatOutput(row.original.highestOutput)}
        <span className="text-muted-foreground">
          {formatOutputUnit(row.original.highestOutput)}
        </span>
      </>
    ),
  },
]

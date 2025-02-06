"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import Link from "next/link"
import type { UserRide } from "@services/leaderboard"
import { useLeaderboardState } from "@components/leaderboard-state"

interface Props {
  rides: UserRide[]
}

export function RideList({ rides }: Props) {
  const { dateRange } = useLeaderboardState()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Ride</TableHead>
          <TableHead>Instructor/Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rides.map((ride) => (
          <TableRow key={`${ride.date}-${ride.id}`}>
            <TableCell className="text-nowrap">
              <Link
                href={
                  dateRange?.endDate === ride.date
                    ? "/latest"
                    : `/archive/${ride.date}`
                }
                className="text-primary hover:text-primary/80 hover:underline"
              >
                {ride.date}
              </Link>
            </TableCell>
            <TableCell>{ride.title}</TableCell>
            <TableCell>{ride.instructor_name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

import { format } from "date-fns"
import type { Metadata } from "next"
import Image from "next/image"
import type React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { getScenicRideSchedule } from "@lib/scenic-rides"
import { parseDate } from "@lib/utils"

export const metadata: Metadata = {
  title: "#TheEggCarton Ride Schedule",
  description: "The upcoming order of scenic rides for #TheEggCarton",
}

export default async function SchedulePage(): Promise<React.ReactElement> {
  const rides = await getScenicRideSchedule()

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">Ride Schedule</h1>
      <p className="mx-4 mb-6 text-left text-sm text-muted-foreground">
        Rides below are listed from next to be picked to most recently posted.
        Lionbot always picks a brand new scenic ride first, before working
        through this schedule, so a newly added ride may jump the queue.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Ride</TableHead>
            <TableHead className="text-nowrap text-center">Published</TableHead>
            <TableHead className="text-nowrap text-center">
              Last Posted
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rides.map((ride) => (
            <TableRow key={`${ride.title}-${ride.published_date}`}>
              <TableCell>
                {ride.image_url != null && ride.image_url !== "" ? (
                  <div className="relative aspect-video h-auto w-28 overflow-hidden rounded-md">
                    <Image
                      src={ride.image_url}
                      alt={ride.title}
                      sizes="112px"
                      className="object-cover"
                      blurDataURL="data:image/webp;base64,UklGRgYCAABXRUJQVlA4WAoAAAAgAAAACQAABQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggGAAAADABAJ0BKgoABgAAgA4lpAADcAD+9QgAAA=="
                      placeholder="blur"
                      fill
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-28 rounded-md bg-muted" />
                )}
              </TableCell>
              <TableCell>
                {ride.title}
                <div className="mt-1 text-sm text-muted-foreground">
                  {ride.location}
                </div>
              </TableCell>
              <TableCell className="text-nowrap text-center">
                {format(parseDate(ride.published_date), "d MMM yyyy")}
              </TableCell>
              <TableCell className="text-nowrap text-center">
                {ride.last_posted_at != null ? (
                  format(parseDate(ride.last_posted_at), "d MMM")
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion"
import { ChartConfig } from "@components/ui/chart"
import { DataTable } from "@components/data-table"
import { rideColumns } from "@app/leaderboard/columns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { UserAvatar } from "@components/user-avatar"
import { getAvatarUrl, humanize, localizeNumber } from "@lib/utils"
import { Sparkle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import pluralize from "pluralize"
import * as React from "react"
import type { LeaderboardDisplayProps } from "../types/components"
import { useLeaderboardState } from "./leaderboard-state"

function sortWorkouts(workouts: any[]): any[] {
  return [...workouts].sort((a, b) => b.total_work - a.total_work)
}

export function LeaderboardDisplay(props: LeaderboardDisplayProps) {
  const {
    rides,
    totals,
    totalsList,
    totalRiders,
    averageRideCount,
    totalOutput,
    PBList,
    avatars,
  } = props
  const accordionRef = React.useRef<HTMLDivElement>(null)
  const { useMetric, numberFormat, autoOpen } = useLeaderboardState()

  const getDefaultAccordionValue = React.useCallback(() => {
    if (!autoOpen) return undefined
    if (rides.length > 0) return rides[0].id
    if (Object.keys(totals).length > 0) return "endurance"
    return undefined
  }, [autoOpen, rides, totals])

  const handleAccordionChange = (value: string) => {
    if (value && accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const formatDistance = (distance: number) => {
    if (useMetric) {
      return (
        <>
          {localizeNumber(distance, numberFormat)}
          <span className="text-muted-foreground"> km</span>
        </>
      )
    }
    return (
      <>
        {localizeNumber(distance * 0.621371, numberFormat)}
        <span className="text-muted-foreground"> mi</span>
      </>
    )
  }

  const chartConfig: ChartConfig = {
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

  const isScenicRide = (ride: any) => ride.instructor_name.split(" ").length > 2

  return (
    <>
      <Accordion
        ref={accordionRef}
        type="single"
        collapsible
        defaultValue={getDefaultAccordionValue()}
        onValueChange={handleAccordionChange}
      >
        {rides.map((ride) => (
          <AccordionItem key={ride.id} value={ride.id}>
            <AccordionTrigger>
              <h3 className="select-none text-lg md:text-xl">{ride.title}</h3>
            </AccordionTrigger>
            <AccordionContent>
              <a
                href={ride.url}
                target="_blank"
                className="inset-shadow-xs block rounded-lg p-2 hover:bg-black/20"
              >
                <div className="relative mb-2 flex min-h-24 flex-nowrap items-center gap-4 md:mb-0 md:min-h-px">
                  <div
                    className={
                      isScenicRide(ride)
                        ? "z-20 order-1 md:order-2"
                        : "z-20 order-1 grow text-center text-2xl font-bold md:order-3 md:text-2xl"
                    }
                  >
                    <p>{ride.instructor_name}</p>
                    <p
                      className={
                        isScenicRide(ride)
                          ? "hidden"
                          : "text-base font-normal text-muted-foreground md:text-sm"
                      }
                    >
                      Instructor
                    </p>
                  </div>
                  <div
                    className={
                      isScenicRide(ride)
                        ? "z-20 order-2 min-w-[50%] grow text-center md:order-1 md:min-w-fit"
                        : "z-20 order-2 min-w-[50%] grow text-center md:order-1 md:min-w-fit"
                    }
                  >
                    <b className="text-4xl font-bold md:text-3xl">
                      {ride.workouts.length}
                    </b>
                    <p className="text-base text-muted-foreground md:text-sm">
                      Total riders
                    </p>
                  </div>
                  {ride.image_url && (
                    <div
                      className={
                        isScenicRide(ride)
                          ? "absolute right-0 z-10 order-3 block aspect-video h-auto w-[50%] rounded-lg opacity-40 md:relative md:min-h-[calc(180px*9/16)] md:w-[180px] md:opacity-100"
                          : "absolute right-0 z-10 order-3 block aspect-video h-auto w-[50%] rounded-lg opacity-40 md:relative md:order-2 md:min-h-[calc(180px*9/16)] md:w-[180px] md:opacity-100"
                      }
                    >
                      <Image
                        src={ride.image_url}
                        alt={ride.title}
                        sizes="(max-width: 768px) 50%, 180px"
                        className="rounded-lg"
                        blurDataURL="data:image/webp;base64,UklGRgYCAABXRUJQVlA4WAoAAAAgAAAACQAABQAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDggGAAAADABAJ0BKgoABgAAgA4lpAADcAD+9QgAAA=="
                        placeholder="blur"
                        fill
                      />
                    </div>
                  )}
                </div>
              </a>
              <DataTable
                columns={rideColumns(avatars, useMetric, numberFormat)}
                data={sortWorkouts(ride.workouts)}
              />
            </AccordionContent>
          </AccordionItem>
        ))}

        {Object.keys(totals).length > 0 && (
          <AccordionItem value="endurance">
            <AccordionTrigger>
              <h3 className="select-none text-lg md:text-xl">
                Endurance Leaderboard
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex grow items-end justify-center gap-6 text-center">
                <div>
                  <b className="text-3xl font-bold">{totalRiders}</b>
                  <p className="text-sm text-muted-foreground">Total riders</p>
                </div>
                <div>
                  <b className="text-4xl font-bold">
                    {localizeNumber(
                      Math.round((totalOutput / 1000000) * 100) / 100,
                      numberFormat,
                    )}
                    <span className="text-base"> MJ</span>
                  </b>
                  <p className="text-sm text-muted-foreground">
                    Combined Output
                  </p>
                </div>
                <div>
                  <b className="text-2xl font-bold">
                    {localizeNumber(averageRideCount, numberFormat)}
                  </b>
                  <p className="text-sm text-muted-foreground">
                    Average ride count
                  </p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Rides</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-nowrap">
                  {totalsList.map((user, i) => (
                    <TableRow key={user.username}>
                      <TableCell>{humanize(i)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            avatar_url={getAvatarUrl(user.username, avatars)}
                            width={21}
                            height={21}
                          />
                          <Link
                            className="text-primary hover:text-primary/80 hover:underline"
                            href={`/cyclist/${user.username}`}
                          >
                            {user.username}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {localizeNumber(
                          Math.round(user.output / 1000),
                          numberFormat,
                        )}{" "}
                        kJ
                      </TableCell>
                      <TableCell>
                        {user.rides} {pluralize("ride", user.rides)}
                      </TableCell>
                      <TableCell>{user.duration} mins</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )}
        {PBList.length > 0 && (
          <AccordionItem value="pbs">
            <AccordionTrigger>
              <h3 className="select-none text-lg md:text-xl">
                <div
                  className="inline-block h-[1em] align-middle"
                  title="New PB"
                >
                  <Sparkle width="1em" height="1em" color="gold" />
                </div>
                <span className="mx-1">New PBs</span>
                <div
                  className="inline-block h-[1em] align-middle"
                  title="New PB"
                >
                  <Sparkle width="1em" height="1em" color="gold" />
                </div>
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>PBs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PBList.map(([username, pbs]) => (
                    <TableRow key={username}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            avatar_url={getAvatarUrl(username, avatars)}
                            width={21}
                            height={21}
                          />
                          <Link
                            className="text-primary hover:text-primary/80 hover:underline"
                            href={`/cyclist/${username}`}
                          >
                            {username}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pbs.map((pb) => (
                          <p key={`${username}-pb-${pb.total_work}`}>
                            <b>
                              {localizeNumber(
                                Math.round(pb.total_work / 1000),
                                numberFormat,
                              )}
                            </b>{" "}
                            kJ / {pb.duration} mins
                          </p>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </>
  )
}

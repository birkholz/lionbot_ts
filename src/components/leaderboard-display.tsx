"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion"
import { ChartConfig, ChartContainer } from "@components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip"
import { humanize, localizeNumber } from "@lib/utils"
import { Sparkle } from "lucide-react"
import Image from "next/image"
import pluralize from "pluralize"
import * as React from "react"
import { Pie, PieChart } from "recharts"
import type {
  LeaderboardDisplayProps,
  Ride,
  Workout,
} from "../types/components"
import { useLeaderboardState } from "./leaderboard-state"
function sortWorkouts(workouts: Workout[]): Workout[] {
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

  const isScenicRide = (ride: Ride) =>
    ride.instructor_name.split(" ").length > 2

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-center md:text-left">
                      Total Output
                    </TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-center md:text-left">
                      <a
                        href="https://www.strive.bike/blog/strive-score-explained"
                        target="_blank"
                        className="cursor-help hover:text-foreground hover:underline"
                      >
                        Strive Score
                      </a>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-nowrap">
                  {sortWorkouts(ride.workouts).map((workout, i) => (
                    <TableRow
                      key={`${workout.user_username}-${workout.total_work}`}
                    >
                      <TableCell>{humanize(i)}</TableCell>
                      <TableCell>
                        <a
                          target="_blank"
                          className="text-blue-500 hover:text-blue-400 hover:underline"
                          href={`https://members.onepeloton.com/members/${workout.user_username}/overview`}
                        >
                          {workout.user_username}
                        </a>
                      </TableCell>
                      <TableCell>
                        {localizeNumber(
                          Math.round(workout.total_work / 1000),
                          numberFormat,
                        )}
                        <span className="text-muted-foreground"> kJ </span>
                        {workout.is_new_pb && (
                          <Tooltip>
                            <TooltipTrigger className="inline-block h-[1em] cursor-default align-middle">
                              <Sparkle width="1em" height="1em" color="gold" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>New PB</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>{formatDistance(workout.distance)}</TableCell>
                      <TableCell>
                        {Math.round(workout.duration / 60)}
                        <span className="text-muted-foreground"> mins</span>
                      </TableCell>
                      {workout.effort_zones?.total_effort_points ? (
                        <TableCell className="min-w-[6em] md:text-left">
                          {localizeNumber(
                            workout.effort_zones.total_effort_points,
                            numberFormat,
                          )}
                          <ChartContainer
                            config={chartConfig}
                            className="float-left mr-1 inline-block h-[20px] w-[20px]"
                          >
                            <PieChart>
                              <Pie
                                data={Object.entries(
                                  workout.effort_zones
                                    .heart_rate_zone_durations,
                                )
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
                        </TableCell>
                      ) : (
                        <TableCell className="text-center md:pl-[3em] md:text-left">
                          <span className="text-muted-foreground">-</span>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                        <a
                          target="_blank"
                          className="text-blue-500 hover:text-blue-400 hover:underline"
                          href={`https://members.onepeloton.com/members/${user.username}/overview`}
                        >
                          {user.username}
                        </a>
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
                        <a
                          target="_blank"
                          className="text-blue-500 hover:text-blue-400 hover:underline"
                          href={`https://members.onepeloton.com/members/${username}/overview`}
                        >
                          {username}
                        </a>
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

"use client"

import { DateNavigation } from "@components/date-navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion"
import { ChartConfig, ChartContainer } from "@components/ui/chart"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@components/ui/hover-card"
import { Separator } from "@components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { Toggle } from "@components/ui/toggle"
import { formatNumber, humanize } from "@lib/utils"
import type { LeaderboardDisplayProps, Workout } from "@types"
import { BadgeHelp, Ruler, Sparkle } from "lucide-react"
import dynamic from "next/dynamic"
import pluralize from "pluralize"
import * as React from "react"
import { Pie, PieChart } from "recharts"

const ClientOnlyTooltip = dynamic(
  () => import("@components/ui/tooltip").then((mod) => mod.Tooltip),
  { ssr: false },
)

const ClientOnlyTooltipProvider = dynamic(
  () => import("@components/ui/tooltip").then((mod) => mod.TooltipProvider),
  { ssr: false },
)

const ClientOnlyTooltipTrigger = dynamic(
  () => import("@components/ui/tooltip").then((mod) => mod.TooltipTrigger),
  { ssr: false },
)

const ClientOnlyTooltipContent = dynamic(
  () => import("@components/ui/tooltip").then((mod) => mod.TooltipContent),
  { ssr: false },
)

function sortWorkouts(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => b.total_work - a.total_work)
}

export function LeaderboardDisplay({
  displayDate,
  rides,
  totals,
  totalsList,
  totalRiders,
  medianRideCount,
  averageRideCount,
  totalOutput,
  PBList,
  startDate,
  endDate,
}: LeaderboardDisplayProps) {
  // const openAccordion = rides.length > 0 ? rides[0].id : "endurance"
  const accordionRef = React.useRef<HTMLDivElement>(null)
  const [useMetric, setUseMetric] = React.useState(true)

  React.useEffect(() => {
    const savedMetric = localStorage.getItem("useMetric")
    if (savedMetric !== null) {
      setUseMetric(savedMetric !== "false")
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem("useMetric", useMetric.toString())
  }, [useMetric])

  const handleAccordionChange = (value: string) => {
    if (value && accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const formatDistance = (distance: number) => {
    if (useMetric) {
      return (
        <>
          {distance.toFixed(2)}
          <span className="text-muted-foreground"> km</span>
        </>
      )
    }
    return (
      <>
        {(distance * 0.621371).toFixed(2)}
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

  return (
    <div className="relative mx-auto my-4 max-w-2xl rounded-xl bg-zinc-900 p-3 shadow-md">
      <div className="absolute left-3 top-3">
        <ClientOnlyTooltipProvider>
          <ClientOnlyTooltip>
            <ClientOnlyTooltipTrigger asChild>
              <Toggle
                variant="outline"
                aria-label="Distance Units"
                pressed={useMetric}
                onPressedChange={setUseMetric}
              >
                <Ruler className="mr-1" />
                <span>{useMetric ? "km" : "mi"}</span>
              </Toggle>
            </ClientOnlyTooltipTrigger>
            <ClientOnlyTooltipContent>
              <p>Change the distance units</p>
            </ClientOnlyTooltipContent>
          </ClientOnlyTooltip>
        </ClientOnlyTooltipProvider>
      </div>
      <div className="absolute right-3 top-3 h-[2rem] w-[2rem]">
        <HoverCard>
          <HoverCardTrigger>
            <BadgeHelp width="2rem" height="2rem" className="opacity-25" />
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm">
              Ride leaderboards are delayed by one day to allow more people to
              participate. They include all riders in the tag that did the ride
              from 12 hours before NL until the start of NL's stream the
              following day.
            </p>
            <p className="text-sm">
              Don't want to be on the leaderboard? Setting your Peloton profile
              to private, or blocking Lionbot, will hide you from future
              leaderboards.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>
      <h1 className="text-center text-3xl font-bold tracking-tight">
        <span className="text-primary">#TheEggCarton</span> Leaderboards
      </h1>
      <DateNavigation
        date={displayDate}
        startDate={startDate}
        endDate={endDate}
      />
      <Separator className="my-4" />
      <Accordion
        ref={accordionRef}
        type="single"
        collapsible
        // defaultValue={openAccordion}
        onValueChange={handleAccordionChange}
      >
        {rides.map((ride) => (
          <AccordionItem key={ride.id} value={ride.id}>
            <AccordionTrigger>
              <h3 className="text-xl">{ride.title}</h3>
            </AccordionTrigger>
            <AccordionContent>
              <a
                href={ride.url}
                target="_blank"
                className="inset-shadow-xs block rounded-lg p-2 hover:bg-black/20"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <b className="text-3xl font-bold">{ride.workouts.length}</b>
                    <p className="text-sm text-muted-foreground">
                      Total riders
                    </p>
                  </div>
                  <div>
                    <p>{ride.instructor_name}</p>
                    {/* <p>
                    NL rode:{" "}
                    {new Date(ride.start_time * 1000).toLocaleTimeString(
                      "en-US",
                      {
                        timeZone: "America/Los_Angeles",
                      },
                    )}{" "}
                    PT
                  </p> */}
                  </div>
                  {ride.image_url && (
                    <img
                      src={ride.image_url}
                      alt={ride.title}
                      width={180}
                      className="block rounded-lg"
                    />
                  )}
                </div>
              </a>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Total Output</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>
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
                <TableBody>
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
                        {Math.round(workout.total_work / 1000)}
                        <span className="text-muted-foreground"> kJ </span>
                        {workout.is_new_pb && (
                          <ClientOnlyTooltipProvider>
                            <ClientOnlyTooltip>
                              <ClientOnlyTooltipTrigger className="inline-block h-[1em] cursor-default align-middle">
                                <Sparkle
                                  width="1em"
                                  height="1em"
                                  color="gold"
                                />
                              </ClientOnlyTooltipTrigger>
                              <ClientOnlyTooltipContent>
                                <p>New PB</p>
                              </ClientOnlyTooltipContent>
                            </ClientOnlyTooltip>
                          </ClientOnlyTooltipProvider>
                        )}
                      </TableCell>
                      <TableCell>{formatDistance(workout.distance)}</TableCell>
                      <TableCell>
                        {Math.round(workout.duration / 60)}
                        <span className="text-muted-foreground"> mins</span>
                      </TableCell>
                      {workout.effort_zones?.total_effort_points ? (
                        <TableCell>
                          {workout.effort_zones.total_effort_points}
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
                        <TableCell>
                          <span className="text-center text-muted-foreground">
                            -
                          </span>
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
              <h3 className="text-xl">Endurance Leaderboard</h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-2 flex grow items-end justify-center gap-6 text-center">
                <div>
                  <b className="text-3xl font-bold">{totalRiders}</b>
                  <p className="text-sm text-muted-foreground">Total riders</p>
                </div>
                <div>
                  <b className="text-4xl font-bold">
                    {Math.round((totalOutput / 1000000) * 100) / 100}
                    <span className="text-base"> MJ</span>
                  </b>
                  <p className="text-sm text-muted-foreground">
                    Combined Output
                  </p>
                </div>
                {/* <div>
                  <b className="text-2xl font-bold">
                    {formatNumber(medianRideCount)}
                  </b>
                  <p className="text-sm text-muted-foreground">
                    Median ride count
                  </p>
                </div> */}
                <div>
                  <b className="text-2xl font-bold">
                    {formatNumber(averageRideCount)}
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
                <TableBody>
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
                      <TableCell>{Math.round(user.output / 1000)} kJ</TableCell>
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
              <h3 className="text-xl">
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
                            <b>{Math.round(pb.total_work / 1000)}</b> kJ /{" "}
                            {pb.duration} mins
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
    </div>
  )
}

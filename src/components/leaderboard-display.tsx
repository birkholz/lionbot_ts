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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Settings, Sparkle } from "lucide-react"
import pluralize from "pluralize"
import * as React from "react"
import { Pie, PieChart } from "recharts"
import type { LeaderboardDisplayProps, Workout } from "../types/components"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Switch } from "./ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import Link from "next/link"
function sortWorkouts(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => b.total_work - a.total_work)
}

export function LeaderboardDisplay(props: LeaderboardDisplayProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <LeaderboardContent {...props} />
}

function LeaderboardContent({
  rides,
  totals,
  totalsList,
  totalRiders,
  averageRideCount,
  totalOutput,
  PBList,
}: LeaderboardDisplayProps) {
  const accordionRef = React.useRef<HTMLDivElement>(null)
  const [useMetric, setUseMetric] = React.useState(() => {
    const saved = localStorage.getItem("useMetric")
    return saved !== null ? saved === "true" : true
  })
  const [numberFormat, setNumberFormat] = React.useState(() => {
    const saved = localStorage.getItem("numberFormat")
    return saved || "en-US"
  })
  const [autoOpen, setAutoOpen] = React.useState(() => {
    const saved = localStorage.getItem("autoOpen")
    return saved !== null ? saved === "true" : false
  })

  const getDefaultAccordionValue = React.useCallback(() => {
    if (!autoOpen) return undefined
    if (rides.length > 0) return rides[0].id
    if (Object.keys(totals).length > 0) return "endurance"
    return undefined
  }, [autoOpen, rides, totals])

  React.useEffect(() => {
    localStorage.setItem("useMetric", useMetric.toString())
  }, [useMetric])

  React.useEffect(() => {
    localStorage.setItem("numberFormat", numberFormat)
  }, [numberFormat])

  React.useEffect(() => {
    localStorage.setItem("autoOpen", autoOpen.toString())
  }, [autoOpen])

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

  return (
    <>
      <div className="absolute right-3 top-3">
        <Dialog>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Settings & Info"
                >
                  <Settings />
                </Button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent>
              <VisuallyHidden>
                <DialogTitle>Settings & Info</DialogTitle>
              </VisuallyHidden>
              <p>Settings & Info</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent
            className="max-w-md gap-2 p-2"
            hideClose
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <Tabs defaultValue="settings">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>
              <TabsContent value="settings">
                <div className="grid grid-cols-5 gap-4 p-4">
                  <div className="col-span-2 mr-2 text-right">
                    <Label
                      htmlFor="distance-units"
                      className="text-muted-foreground"
                    >
                      Distance Units
                    </Label>
                  </div>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Label
                      htmlFor="distance-units"
                      onClick={() => setUseMetric(true)}
                      className="text-right"
                    >
                      Imperial (mi)
                    </Label>
                    <Switch
                      id="distance-units"
                      checked={useMetric}
                      onCheckedChange={setUseMetric}
                      className="data-[state=checked]:bg-zinc-300 data-[state=unchecked]:bg-zinc-300"
                    />
                    <Label
                      htmlFor="distance-units"
                      onClick={() => setUseMetric(false)}
                    >
                      Metric (km)
                    </Label>
                  </div>
                  <div className="col-span-2 mr-2 text-right">
                    <Label
                      htmlFor="number-format"
                      className="align-middle text-muted-foreground"
                    >
                      Number Format
                    </Label>
                  </div>
                  <Select value={numberFormat} onValueChange={setNumberFormat}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder={`1,234.56 ${useMetric ? "km" : "mi"}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">
                        1,234.56 {useMetric ? "km" : "mi"}
                      </SelectItem>
                      <SelectItem value="de-DE">
                        1.234,56 {useMetric ? "km" : "mi"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="col-span-2 mr-2 text-right">
                    <Label
                      htmlFor="auto-open"
                      className="align-middle text-muted-foreground"
                    >
                      Auto-open first leaderboard
                    </Label>
                  </div>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="auto-open"
                      checked={autoOpen}
                      onCheckedChange={setAutoOpen}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="info">
                <div className="p-4">
                  <p>
                    Ride leaderboards are delayed by one day to allow more
                    people to participate. They include all riders in the tag
                    that did the ride from 12 hours before NL until the start of
                    NL's stream the following day.
                  </p>
                  <p className="mt-4">
                    Don't want to be on the leaderboard? Setting your Peloton
                    profile to private, or blocking Lionbot, will hide you from
                    future leaderboards.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="items-center justify-center">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
              <h3 className="select-none text-xl">{ride.title}</h3>
            </AccordionTrigger>
            <AccordionContent>
              <a
                href={ride.url}
                target="_blank"
                className="inset-shadow-xs block rounded-lg p-2 hover:bg-black/20"
              >
                <div className="relative flex flex-nowrap items-center gap-4">
                  <div className="z-20 order-1 md:order-3">
                    <p>{ride.instructor_name}</p>
                  </div>
                  <div className="z-20 order-2 min-w-[50%] grow text-center md:order-1 md:min-w-fit">
                    <b className="text-4xl font-bold md:text-3xl">
                      {ride.workouts.length}
                    </b>
                    <p className="text-base text-muted-foreground md:text-sm">
                      Total riders
                    </p>
                  </div>
                  {ride.image_url && (
                    <img
                      src={ride.image_url}
                      alt={ride.title}
                      className="absolute right-0 z-10 order-2 block w-[50%] rounded-lg opacity-40 md:static md:w-[180px] md:opacity-100"
                    />
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
              <h3 className="select-none text-xl">Endurance Leaderboard</h3>
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
              <h3 className="select-none text-xl">
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

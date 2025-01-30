"use client"

import pluralize from "pluralize"
import * as React from "react"
import { formatNumber, humanize, type UserTotal } from "../lionbot/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { DateNavigation } from "./date-navigation"
import { Separator } from "./ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

type Workout = {
  user_username: string
  total_work: number
  is_new_pb: boolean
  strive_score?: number
  avg_cadence: number
  avg_resistance: number
}

type Ride = {
  id: string
  title: string
  instructor_name: string
  start_time: number
  url: string
  image_url: string
  workouts: Workout[]
}

type Props = {
  displayDate: Date
  rides: Ride[]
  totals: Record<string, UserTotal>
  totalsList: UserTotal[]
  totalRiders: number
  medianRideCount: number
  averageRideCount: number
  totalOutput: number
  PBList: [string, { total_work: number; duration: number }[]][]
  startDate: Date
  endDate: Date
}

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
}: Props) {
  // const openAccordion = rides.length > 0 ? rides[0].id : "endurance"
  const accordionRef = React.useRef<HTMLDivElement>(null)

  const handleAccordionChange = (value: string) => {
    if (value && accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="mx-auto mt-4 max-w-2xl rounded-xl bg-zinc-900 p-3 shadow-md">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        #TheEggCarton Leaderboards
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
              <h3>{ride.title} - Leaderboard</h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-4">
                <div>
                  <a
                    target="_blank"
                    className="text-blue-500 hover:text-blue-400 hover:underline"
                    href={ride.url}
                  >
                    Class Link
                  </a>
                  <p>Instructor: {ride.instructor_name}</p>
                  <p>
                    NL rode:{" "}
                    {new Date(ride.start_time * 1000).toLocaleTimeString(
                      "en-US",
                      {
                        timeZone: "America/Los_Angeles",
                      },
                    )}{" "}
                    PT
                  </p>
                  <p>
                    Total riders: <b>{ride.workouts.length}</b>
                  </p>
                </div>
                {ride.image_url && (
                  <img
                    src={ride.image_url}
                    alt={ride.title}
                    width={200}
                    className="block rounded-lg"
                  />
                )}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Total Output</TableHead>
                    <TableHead>Avg Cadence</TableHead>
                    <TableHead>Avg Resistance</TableHead>
                    <TableHead>Strive Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortWorkouts(ride.workouts).map((workout, i) => (
                    <TableRow
                      key={`${workout.user_username}-${workout.total_work}`}
                    >
                      <TableCell>{humanize(i)} Place</TableCell>
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
                        {Math.round(workout.total_work / 1000)} kJ
                      </TableCell>
                      <TableCell>
                        {workout.avg_cadence
                          ? `${workout.avg_cadence} rpm`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {workout.avg_resistance
                          ? `${workout.avg_resistance}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {workout.strive_score
                          ? `${workout.strive_score}`
                          : "N/A"}
                      </TableCell>
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
              <h3>Endurance Leaderboard</h3>
            </AccordionTrigger>
            <AccordionContent>
              <p>
                Total riders: <b>{totalRiders}</b>
              </p>
              <p>
                Median/Average ride count:{" "}
                <b>{formatNumber(medianRideCount)}</b> /{" "}
                <b>{formatNumber(averageRideCount)}</b>
              </p>
              <p>
                Combined Output:{" "}
                <b>{Math.round((totalOutput / 1000000) * 100) / 100} MJ</b>
              </p>
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
                      <TableCell>{humanize(i)} Place</TableCell>
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
              <h3>Players who have PB'd</h3>
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

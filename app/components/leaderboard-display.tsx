'use client';

import { format, subDays } from "date-fns";
import pluralize from "pluralize";
import { UserTotal, formatNumber, humanize } from "../../lionbot/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "./ui/table"
import { Separator } from "./ui/separator"

type Workout = {
    user_username: string;
    total_work: number;
    is_new_pb: boolean;
}

type Ride = {
    id: string;
    title: string;
    instructor_name: string;
    start_time: number;
    url: string;
    workouts: Workout[];
}

type Props = {
    date: Date;
    rides: Ride[];
    totals: Record<string, UserTotal>;
    totalsList: UserTotal[];
    totalRiders: number;
    medianRideCount: number;
    averageRideCount: number;
    totalOutput: number;
    PBList: [string, { total_work: number; duration: number; }[]][];
}

function sortWorkouts(workouts: Workout[]): Workout[] {
    return [...workouts].sort((a, b) => b.total_work - a.total_work);
}

export function LeaderboardDisplay({
    date,
    rides,
    totals,
    totalsList,
    totalRiders,
    medianRideCount,
    averageRideCount,
    totalOutput,
    PBList
}: Props) {
    return (
        <div className="max-w-xl mx-auto mt-4 p-3 rounded-xl shadow-md bg-zinc-900">
            <h1 className="text-3xl font-bold tracking-tight text-center">#TheEggCarton Leaderboards</h1>
            <h2 className="text-xl font-semibold tracking-tight text-center">Date: {format(date, 'yyyy-MM-dd')}</h2>
            <Separator className="my-4"/>
            <Accordion type="single" collapsible>
                {rides.map((ride) => (
                    <AccordionItem key={ride.id} value={ride.id}>
                        <AccordionTrigger>
                            <h3>{ride.title} - Leaderboard</h3>
                        </AccordionTrigger>
                        <AccordionContent>
                            <a href={ride.url}>Class Link</a>
                            <p>Instructor: {ride.instructor_name}</p>
                            <p>NL rode: {format(new Date(ride.start_time * 1000), 'PPpp')}</p>
                            <p>Total riders: <b>{ride.workouts.length}</b></p>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Output</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortWorkouts(ride.workouts).map((workout, i) => (
                                    <TableRow key={`${workout.user_username}-${workout.total_work}`}>
                                        <TableCell>{humanize(i)} Place</TableCell>
                                        <TableCell><a href={`https://members.onepeloton.com/members/${workout.user_username}/overview`}>{workout.user_username}</a></TableCell>
                                        <TableCell>{Math.round(workout.total_work / 1000)} kJ</TableCell>
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
                            <h3>Endurance Leaderboard {format(subDays(date, 1), 'yyyy-MM-dd')}</h3>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p>Total riders: <b>{totalRiders}</b></p>
                            <p>Median/Average ride count: <b>{formatNumber(medianRideCount)}</b> / <b>{formatNumber(averageRideCount)}</b></p>
                            <p>Combined Output: <b>{Math.round(totalOutput / 1000000 * 100) / 100} MJ</b></p>
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
                                    <TableCell><a href={`https://members.onepeloton.com/members/${user.username}/overview`}>{user.username}</a></TableCell>
                                    <TableCell>{Math.round(user.output / 1000)} kJ</TableCell>
                                    <TableCell>{user.rides} {pluralize('ride', user.rides)}</TableCell>
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
                                        <TableCell><a href={`https://members.onepeloton.com/members/${username}/overview`}>{username}</a></TableCell>
                                        <TableCell>{pbs.map((pb) => (
                                            <p key={`${username}-pb-${pb.total_work}`}><b>{Math.round(pb.total_work / 1000)}</b> kJ / {pb.duration} mins</p>
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
    );
}

'use server';

import { leaderboardsTable } from "../lionbot/db/schema";
import { db } from "../lionbot/db/client";
import { desc } from "drizzle-orm";
import { median } from "mathjs";
import { mean } from "mathjs";
import { UserTotal } from "../lionbot/utils";
import { LeaderboardDisplay } from "./components/leaderboard-display";

type RideData = {
    id: string;
    title: string;
    instructor_name: string;
    start_time: number;
    url: string;
    workouts: {
        user_username: string;
        total_work: number;
        is_new_pb: boolean;
    }[];
}

type LeaderboardJson = {
    rides: Record<string, RideData>;
    totals: Record<string, UserTotal>;
    playersWhoPbd: Record<string, { total_work: number; duration: number; }[]>;
}

export default async function Page() {
    const leaderboards = await db.select().from(leaderboardsTable).orderBy(desc(leaderboardsTable.createdAt)).limit(1);
    const leaderboard = leaderboards[0];

    if (!leaderboard) {
        return <article>
            <h1>#TheEggCarton Leaderboards</h1>
            <p>No leaderboard data available.</p>
        </article>
    }

    const data = leaderboard.json as LeaderboardJson;
    const rides = Object.entries(data.rides).map(([_, ride]) => ({
        id: ride.id,
        title: ride.title,
        instructor_name: ride.instructor_name,
        start_time: ride.start_time,
        url: ride.url,
        workouts: ride.workouts.map(w => ({
            user_username: w.user_username,
            total_work: w.total_work,
            is_new_pb: w.is_new_pb
        }))
    }));

    const totals = data.totals;
    const playersWhoPbd = data.playersWhoPbd;

    const totalsList = Object.values(totals).sort((a, b) => b.output - a.output);
    const totalRiders = totalsList.length;
    const rideCounts = totalsList.map(w => w.rides);
    const medianRideCount = median(rideCounts);
    const averageRideCount = mean(rideCounts);
    const totalOutput = totalsList.reduce((sum, w) => sum + w.output, 0);
    const PBList = Object.entries(playersWhoPbd).sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));

    return <LeaderboardDisplay
        date={leaderboard.createdAt}
        rides={rides}
        totals={totals}
        totalsList={totalsList}
        totalRiders={totalRiders}
        medianRideCount={medianRideCount}
        averageRideCount={averageRideCount}
        totalOutput={totalOutput}
        PBList={PBList}
    />;
}

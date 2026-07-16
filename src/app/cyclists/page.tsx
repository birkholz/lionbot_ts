import { DataTable } from "@components/data-table"
import bothImage from "/public/both.png"
import { getUserStats } from "@services/leaderboard"
import type { Metadata } from "next"
import Link from "next/link"
import { columns } from "./columns"

export const metadata: Metadata = {
  title: "#TheEggCarton Cyclists",
  description: "The recognized members of #TheEggCarton",
  openGraph: {
    images: [{ url: bothImage.src }],
  },
}

export default async function Cyclists() {
  const userStats = await getUserStats()

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">
        <span className="text-[hsl(var(--primary-link))]">
          {userStats.length}
        </span>{" "}
        Cyclists
      </h1>
      <p className="mx-4 mb-6 text-center">
        View{" "}
        <Link
          href="/cyclists/charts"
          className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
        >
          cyclist growth and participation charts
        </Link>
      </p>
      <p className="mx-4 mb-2 text-left text-sm text-muted-foreground">
        This is a list of all the cyclists who have joined any of the group
        rides since the leaderboards started on{" "}
        <Link
          href="/archive/2023-09-22"
          className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
        >
          2023-09-22
        </Link>
        .
      </p>
      <p className="mx-4 mb-2 text-left text-sm text-muted-foreground">
        Total Rides only counts group rides, while Endurance PB is each
        cyclist's best single-day combined output since the start of the
        leaderboards.
      </p>
      <DataTable
        columns={columns}
        data={userStats}
        defaultSorting={[{ id: "totalRides", desc: true }]}
      />
    </div>
  )
}

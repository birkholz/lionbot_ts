import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { UserAvatar } from "@components/user-avatar"
import { getCachedUserRides, getCachedUserStats } from "@lib/data"
import { ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{
    username: string
  }>
}

// TODO: Uncomment this when we fix whatever is causing the build to fail
// export async function generateStaticParams() {
//   if (process.env.NODE_ENV === "development") {
//     return []
//   }
//   const userStats = await getCachedUserStats()
//   return userStats.map((user) => ({
//     username: user.username,
//   }))
// }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} - #TheEggCarton`,
  }
}

export default async function CyclistProfile({ params }: Props) {
  const { username } = await params
  const userStats = await getCachedUserStats()
  const stats = userStats.find((user) => user.username === username)
  const rides = await getCachedUserRides(username)

  if (!stats) {
    notFound()
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-4">
        {stats.avatar_url && (
          <UserAvatar avatar_url={stats.avatar_url} width={80} height={80} />
        )}
        <div>
          <h1 className="text-3xl font-bold">
            <a
              href={`https://members.onepeloton.com/members/${username}/overview`}
              target="_blank"
              className="text-primary hover:text-primary/80 hover:underline"
            >
              {username}
              <ExternalLink className="ml-1 inline-block h-4 w-4" />
            </a>
          </h1>
          <p className="text-sm text-muted-foreground">
            First group ride on{" "}
            <Link
              href={`/archive/${stats.firstRide}`}
              className="text-primary hover:text-primary/80 hover:underline"
            >
              {stats.firstRide}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Total group rides:{" "}
            <span className="font-bold text-foreground">
              {stats.totalRides}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-4 text-center text-xl font-bold">Group Rides</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Ride</TableHead>
              <TableHead>Instructor/Description</TableHead>
              <TableHead className="text-right">Output</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rides.map((ride) => (
              <TableRow key={`${ride.date}-${ride.id}`}>
                <TableCell className="text-nowrap">
                  <Link
                    href={`/archive/${ride.date}`}
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {ride.date}
                  </Link>
                </TableCell>
                <TableCell>{ride.title}</TableCell>
                <TableCell>{ride.instructor_name}</TableCell>
                <TableCell className="text-nowrap text-right">
                  {Math.round(ride.total_work / 1000)} kJ
                  {ride.is_new_pb && " ⭐"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

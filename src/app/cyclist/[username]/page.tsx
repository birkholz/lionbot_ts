import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table"
import { UserAvatar } from "@components/user-avatar"
import { getCyclist, getUserRides } from "@services/leaderboard"
import { ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@db/client"
import { cyclistsTable } from "@db/schema"
import { RideList } from "./ride-list"
import { isNotNull } from "drizzle-orm"
interface Props {
  params: Promise<{
    username: string
  }>
}

export async function generateStaticParams() {
  if (process.env.NODE_ENV === "development") {
    return []
  }
  return await db
    .select({ username: cyclistsTable.username })
    .from(cyclistsTable)
    .where(isNotNull(cyclistsTable.first_ride))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} - #TheEggCarton`,
  }
}

export default async function CyclistProfile({ params }: Props) {
  const { username } = await params
  const [cyclist, rides] = await Promise.all([
    getCyclist(username),
    getUserRides(username),
  ])
  const avatar_url =
    cyclist?.avatar_url ?? `https://placehold.co/21x21/red/red.webp`

  if (!cyclist || !cyclist.first_ride) {
    notFound()
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-center gap-4">
        <UserAvatar avatar_url={avatar_url} width={80} height={80} />
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
              href={`/archive/${cyclist.first_ride}`}
              className="text-primary hover:text-primary/80 hover:underline"
            >
              {cyclist.first_ride}
            </Link>
          </p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-4 text-center text-xl font-bold">
          <span className="text-primary">{rides.length}</span> Group Rides
        </h2>
        <RideList rides={rides} />
      </div>
    </>
  )
}

import bothImage from "/public/both.png"
import { ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type React from "react"

import { UserAvatar } from "@components/user-avatar"
import { getCyclist, getUserRides } from "@services/leaderboard"

import { RideList } from "./ride-list"
interface Props {
  params: Promise<{
    username: string
  }>
}

// There are thousands of cyclists, so pre-rendering all of them at build
// time is what stalls Vercel builds. Pages are still cached and revalidated
// the same way (see the leaderboards cron's revalidatePath calls) — they're
// just generated on first request instead of at build time.
export const dynamicParams = true

export async function generateStaticParams(): Promise<{ username: string }[]> {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} - #TheEggCarton`,
    openGraph: {
      images: [{ url: bothImage.src }],
    },
  }
}

export default async function CyclistProfile({
  params,
}: Props): Promise<React.ReactElement> {
  const { username } = await params
  const [cyclist, rides] = await Promise.all([
    getCyclist(username),
    getUserRides(username),
  ])
  const avatar_url =
    cyclist?.avatar_url ?? `https://placehold.co/21x21/red/red.webp`

  if (!cyclist || cyclist.first_ride == null || cyclist.first_ride === "") {
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
              className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
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

import Link from "next/link"
import type React from "react"

export default function NotFound(): React.ReactElement {
  return (
    <p className="mt-4 text-center">
      Page Not Found.{" "}
      <Link
        className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
        href="/latest"
      >
        Go to latest leaderboard
      </Link>
    </p>
  )
}

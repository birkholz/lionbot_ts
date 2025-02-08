import Link from "next/link"

export default function NotFound() {
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

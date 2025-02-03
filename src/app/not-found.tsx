import Link from "next/link"

export default function NotFound() {
  return (
    <p className="mt-4 text-center">
      Page Not Found.{" "}
      <Link
        className="text-blue-500 hover:text-blue-400 hover:underline"
        href="/latest"
      >
        Go to latest leaderboard
      </Link>
    </p>
  )
}

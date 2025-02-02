import type { NextPage } from "next"

const NotFound: NextPage = () => {
  return (
    <article className="mx-auto mt-4 max-w-2xl rounded-xl bg-zinc-900 p-3 shadow-md">
      <h1 className="text-center text-3xl font-bold tracking-tight">
        <span className="text-primary">#TheEggCarton</span> Leaderboards
      </h1>
      <p className="mt-4 text-center">Page not found.</p>
    </article>
  )
}

export default NotFound

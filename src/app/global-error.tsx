"use client"

import { ThemeProvider } from "../components/theme-provider"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <head>
        <title>#TheEggCarton Leaderboards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="mx-auto mt-4 max-w-2xl rounded-xl bg-zinc-900 p-3 shadow-md">
            <h1 className="text-center text-3xl font-bold tracking-tight">
              <span className="text-primary">#TheEggCarton</span> Leaderboards
            </h1>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold">Something went wrong!</h2>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                onClick={() => reset()}
              >
                Try again
              </button>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

"use client"

import { LeaderboardProvider } from "@components/leaderboard-state"
import { Navigation } from "@components/navigation"
import { ThemeProvider } from "@components/theme-provider"
import { ThemeToggle } from "@components/theme-toggle"
import { Card, CardContent, CardHeader } from "@components/ui/card"
import { TooltipProvider } from "@components/ui/tooltip"
import "@styles/globals.css"
import * as Sentry from "@sentry/nextjs"
import { Inter } from "next/font/google"
import Link from "next/link"
import { useEffect } from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider delayDuration={0}>
            <LeaderboardProvider>
              <Card className="relative mx-auto max-w-2xl md:mt-4">
                <div className="absolute right-3 top-3">
                  <ThemeToggle />
                </div>
                <CardHeader>
                  <h1 className="text-center text-3xl font-extrabold italic tracking-tight md:text-4xl">
                    <Link href="/" className="cursor-pointer">
                      <span className="text-primary">#TheEggCarton</span>
                    </Link>
                  </h1>
                  <Navigation />
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">Something went wrong!</h2>
                    <p className="mt-2 text-muted-foreground">
                      {error.message || "An unexpected error occurred"}
                    </p>
                    <p className="mt-4">
                      <Link
                        href="/"
                        className="text-[hsl(var(--primary-link))] hover:text-[hsl(var(--primary-link)/80)] hover:underline"
                      >
                        Return Home
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </LeaderboardProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import { LeaderboardSettings } from "@components/leaderboard-settings"
import { LeaderboardProvider } from "@components/leaderboard-state"
import { Navigation } from "@components/navigation"
import { ThemeProvider } from "@components/theme-provider"
import { ThemeToggle } from "@components/theme-toggle"
import { Card, CardContent, CardHeader } from "@components/ui/card"
import { TooltipProvider } from "@components/ui/tooltip"
import "@styles/globals.css"
import { Analytics } from "@vercel/analytics/react"
import { Inter } from "next/font/google"
import Link from "next/link"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
}

export const metadata = {
  title: "#TheEggCarton Leaderboards",
  description:
    "Daily leaderboards for #TheEggCarton on Peloton, join us at Twitch.tv/Northernlion!",
  appleWebApp: {
    statusBarStyle: "black",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider delayDuration={0}>
            <LeaderboardProvider>
              <Card className="relative mx-auto max-w-2xl md:mt-4">
                <div className="absolute right-3 top-3 flex gap-2">
                  <LeaderboardSettings />
                  <div className="hidden md:block">
                    <ThemeToggle />
                  </div>
                </div>
                <CardHeader>
                  <h1 className="text-center text-3xl font-extrabold italic tracking-tight md:text-4xl">
                    <Link href="/latest" className="cursor-pointer">
                      <span className="text-primary">#TheEggCarton</span>
                    </Link>
                  </h1>
                  <Navigation />
                </CardHeader>
                <CardContent>{children}</CardContent>
              </Card>
            </LeaderboardProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

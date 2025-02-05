import { LeaderboardSettings } from "@components/leaderboard-settings"
import { LeaderboardProvider } from "@components/leaderboard-state"
import { ThemeProvider } from "@components/theme-provider"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu"
import { TooltipProvider } from "@components/ui/tooltip"
import { cn } from "@lib/utils"
import "@styles/globals.css"
import { Analytics } from "@vercel/analytics/react"
import Link from "next/link"
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            <LeaderboardProvider>
              <article className="relative mx-auto max-w-2xl bg-zinc-900 p-3 lg:mt-4 lg:rounded-xl lg:shadow-md">
                <h1 className="text-center text-4xl font-bold tracking-tight">
                  <Link href="/latest" className="cursor-pointer">
                    <span className="text-primary">#TheEggCarton</span>
                  </Link>
                </h1>
                <NavigationMenu className="my-4 max-w-full">
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link href="/latest" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Leaderboards
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/users" legacyBehavior passHref>
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          Users
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "pointer-events-none opacity-50 hover:bg-background hover:text-foreground",
                        )}
                      >
                        Daily Game
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                <LeaderboardSettings />
                {children}
              </article>
            </LeaderboardProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

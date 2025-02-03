import "@styles/globals.css"
import { ThemeProvider } from "@components/theme-provider"
import { TooltipProvider } from "@components/ui/tooltip"
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
            <article className="relative mx-auto max-w-2xl bg-zinc-900 p-3 lg:mt-4 lg:rounded-xl lg:shadow-md">
              <h1 className="text-center text-3xl font-bold tracking-tight">
                <Link href="/latest" className="cursor-pointer">
                  <span className="text-primary">#TheEggCarton</span>{" "}
                  Leaderboards
                </Link>
              </h1>
              {children}
            </article>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

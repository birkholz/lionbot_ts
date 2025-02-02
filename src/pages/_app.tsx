import { TooltipProvider } from "@components/ui/tooltip"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { AppProps } from "next/app"
import { ThemeProvider } from "../components/theme-provider"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <Analytics />
      <SpeedInsights />
      <TooltipProvider delayDuration={0}>
        <Component {...pageProps} />
      </TooltipProvider>
    </ThemeProvider>
  )
}

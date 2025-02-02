import { TooltipProvider } from "@components/ui/tooltip"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { AppProps } from "next/app"
import Head from "next/head"
import { ThemeProvider } from "../components/theme-provider"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>
          <Component {...pageProps} />
        </TooltipProvider>
      </ThemeProvider>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

import { TooltipProvider } from "@components/ui/tooltip"
import { Analytics } from "@vercel/analytics/react"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { ThemeProvider } from "../components/theme-provider"
import "../styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <title>#TheEggCarton Leaderboards</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>
          <article className="relative mx-auto max-w-2xl bg-zinc-900 p-3 lg:mt-4 lg:rounded-xl lg:shadow-md">
            <h1 className="text-center text-3xl font-bold tracking-tight">
              <a
                onClick={() => router.push(`/latest`)}
                className="cursor-pointer"
              >
                <span className="text-primary">#TheEggCarton</span> Leaderboards
              </a>
            </h1>
            <Component {...pageProps} />
          </article>
        </TooltipProvider>
      </ThemeProvider>
      <Analytics />
    </>
  )
}

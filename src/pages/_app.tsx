import "../styles/globals.css"
import { ThemeProvider } from "../components/theme-provider"
import { TooltipProvider } from "@components/ui/tooltip"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  return (
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
  )
}

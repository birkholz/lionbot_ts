// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://42bd7fbb12ef650af335094dc12191b9@o428746.ingest.us.sentry.io/4508813040156672",

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})

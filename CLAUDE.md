# lionbot_ts

A website ([TheEggCarton.bike](https://theeggcarton.bike)) and Discord bot that provide leaderboards and group ride management for a group of Peloton cyclists. Data comes from Peloton's undocumented API, which has been reverse-engineered. Peloton's GraphQL API in particular has stricter security that only allows calls from a personal machine — calls from Vercel's hosting get rejected. The Discord bot features consist of webhook-driven CRONs that post to Discord via an API call.

## Stack

- Next.js (App Router) + TypeScript, run on Bun
- Postgres via Drizzle ORM (`src/db/schema.ts`)
- Tailwind + shadcn/ui components (`src/components/ui`)
- Deployed on Vercel; crons live under `src/app/api/crons/*`

## Setup

```bash
bun install
cp .env.example .env   # set DATABASE_URL and other secrets
bunx drizzle-kit push  # sync schema.ts to your local DB
```

## Dev commands

- `bun run dev` — start the local dev server
- `bun run build` / `bun run start` — production build/serve
- `bun run lint` — ESLint (Next's flat config)
- `bunx tsc --noEmit -p tsconfig.next.json` — typecheck the Next app
- `bunx tsc --noEmit -p tsconfig.bun.json` — typecheck standalone scripts (this config has a large set of pre-existing, unrelated errors from JSX files being checked without a `--jsx` flag; ignore those and only look for errors in the file you touched)

## Database

- `bunx drizzle-kit push` — push `schema.ts` changes straight to a DB, no migration file (typical for local dev)
- `bun run db:generate` — generate a migration file from a `schema.ts` diff
- `bun run db:migrate` — apply pending migrations (uses the `drizzle.__drizzle_migrations` tracking table)

## One-off scripts

Run with `bun run <name>`: `leaderboards`, `fetch-avatars`, `backfill-highest-output`, `backfill-scenic-ride-images`, `post-next-ride`, `follow-followers`. These load `.env`/`.env.local` automatically via Bun.

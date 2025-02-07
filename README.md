# lionbot_ts

This repo aims to be a rewrite of [lionbot](https://github.com/birkholz/lionbot), a bot that posts the daily Peloton leaderboard to a Discord server, as well as handling role management, and other features. In addition to rewriting lionbot, this repo also contains [TheEggCarton.bike](https://theeggcarton.bike), a web version of the leaderboards and so much more.

## Development

This project is built with [Bun](https://bun.sh), a fast all-in-one JavaScript runtime and drop-in replacement for Node.js & npm.

### Prerequisites:

- [Bun](https://bun.sh)
- [Postgres](https://postgresapp.com/)

### To install dependencies:

```bash
bun install
```

### Set up the database

First, create a DB called `lionbot` and then run:

```bash
bunx drizzle-kit push
```

### Provide necessary environment variables:

```bash
cp .env.example .env
```

then change DATABASE_URL to your local postgres database.
To get your PELOTON_TOKEN, log into the website, open Chrome DevTools and go to the Application tab. Your active access token is stored in local storage under one of the `auth0spajs` keys. Copy past it into the .env file. You will need to refresh the token in .env if it expires.

### To generate the latest leaderboard:

```bash
bun run fetch-avatars
bun run leaderboards
```

Note: In order to get the data for private accounts, your account must be an accepted follower of the private account.

### To run the local development server:

```bash
bun run dev
```

### Roadmap:

- [x] Port the daily leaderboard script
- [x] Build [TheEggCarton.bike](https://theeggcarton.bike)
- [ ] Port the discord bot

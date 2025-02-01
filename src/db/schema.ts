import {
  pgTable,
  foreignKey,
  bigint,
  varchar,
  integer,
  boolean,
  serial,
  unique,
  jsonb,
  type PgTableWithColumns,
  date,
} from "drizzle-orm/pg-core"

export const streams: PgTableWithColumns<any> = pgTable(
  "streams",
  {
    id: serial().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    guildId: bigint("guild_id", { mode: "number" }),
    description: varchar(),
    emoji: varchar(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    emojiId: bigint("emoji_id", { mode: "number" }),
    titleContains: varchar("title_contains"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    roleId: bigint("role_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    channelId: bigint("channel_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    latestMessageId: bigint("latest_message_id", { mode: "number" }),
    playlistId: varchar("playlist_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.guildId],
      foreignColumns: [guilds["id"]],
      name: "streams_guild_id_fkey",
    }),
  ],
)

export const guilds: PgTableWithColumns<any> = pgTable(
  "guilds",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    name: varchar(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    roleChannelId: bigint("role_channel_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    roleMessageId: bigint("role_message_id", { mode: "number" }),
    twitchStreamId: integer("twitch_stream_id"),
    pinningEnabled: boolean("pinning_enabled").notNull(),
    twitterStreamId: integer("twitter_stream_id"),
    twitterReplies: boolean("twitter_replies").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.twitchStreamId],
      foreignColumns: [streams["id"]],
      name: "guilds_twitch_stream_id_fkey",
    }),
    foreignKey({
      columns: [table.twitterStreamId],
      foreignColumns: [streams["id"]],
      name: "guilds_twitter_stream_id_fkey",
    }),
  ],
)

export const videos = pgTable(
  "videos",
  {
    id: serial().primaryKey().notNull(),
    videoId: varchar("video_id"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    guildId: bigint("guild_id", { mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.guildId],
      foreignColumns: [guilds["id"]],
      name: "videos_guild_id_fkey",
    }),
    unique("videos_video_id_guild_id").on(table.videoId, table.guildId),
  ],
)

export const alembicVersion = pgTable("alembic_version", {
  versionNum: varchar("version_num", { length: 32 }).primaryKey().notNull(),
})

export const twitchStreams = pgTable(
  "twitch_streams",
  {
    id: serial().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    twitchId: bigint("twitch_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    guildId: bigint("guild_id", { mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.guildId],
      foreignColumns: [guilds["id"]],
      name: "twitch_streams_guild_id_fkey",
    }),
    unique("twitch_streams_twitch_id_guild_id").on(
      table.twitchId,
      table.guildId,
    ),
  ],
)

export const leaderboardsTable = pgTable("leaderboards", {
  id: serial().primaryKey().notNull(),
  json: jsonb("json"),
  date: date("date").notNull().defaultNow(),
})

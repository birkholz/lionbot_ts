import { relations } from "drizzle-orm/relations"
import { streams, guilds, videos, twitchStreams } from "./schema"

export const guildsRelations = relations(guilds, ({ one, many }) => ({
  stream_twitchStreamId: one(streams, {
    fields: [guilds["twitchStreamId"]],
    references: [streams["id"]],
    relationName: "guilds_twitchStreamId_streams_id",
  }),
  stream_twitterStreamId: one(streams, {
    fields: [guilds["twitterStreamId"]],
    references: [streams["id"]],
    relationName: "guilds_twitterStreamId_streams_id",
  }),
  streams: many(streams, {
    relationName: "streams_guildId_guilds_id",
  }),
  videos: many(videos),
  twitchStreams: many(twitchStreams),
}))

export const streamsRelations = relations(streams, ({ one, many }) => ({
  guilds_twitchStreamId: many(guilds, {
    relationName: "guilds_twitchStreamId_streams_id",
  }),
  guilds_twitterStreamId: many(guilds, {
    relationName: "guilds_twitterStreamId_streams_id",
  }),
  guild: one(guilds, {
    fields: [streams["guildId"]],
    references: [guilds["id"]],
    relationName: "streams_guildId_guilds_id",
  }),
}))

export const videosRelations = relations(videos, ({ one }) => ({
  guild: one(guilds, {
    fields: [videos["guildId"]],
    references: [guilds["id"]],
  }),
}))

export const twitchStreamsRelations = relations(twitchStreams, ({ one }) => ({
  guild: one(guilds, {
    fields: [twitchStreams["guildId"]],
    references: [guilds["id"]],
  }),
}))

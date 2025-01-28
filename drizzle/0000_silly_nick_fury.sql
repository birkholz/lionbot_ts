-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "guilds" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar,
	"role_channel_id" bigint,
	"role_message_id" bigint,
	"twitch_stream_id" integer,
	"pinning_enabled" boolean NOT NULL,
	"twitter_stream_id" integer,
	"twitter_replies" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" bigint,
	"description" varchar,
	"emoji" varchar,
	"emoji_id" bigint,
	"title_contains" varchar,
	"role_id" bigint,
	"channel_id" bigint,
	"latest_message_id" bigint,
	"playlist_id" varchar
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" varchar,
	"guild_id" bigint,
	CONSTRAINT "videos_video_id_guild_id" UNIQUE("video_id","guild_id")
);
--> statement-breakpoint
CREATE TABLE "alembic_version" (
	"version_num" varchar(32) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "twitch_streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"twitch_id" bigint,
	"guild_id" bigint,
	CONSTRAINT "twitch_streams_twitch_id_guild_id" UNIQUE("twitch_id","guild_id")
);
--> statement-breakpoint
ALTER TABLE "guilds" ADD CONSTRAINT "guilds_twitch_stream_id_fkey" FOREIGN KEY ("twitch_stream_id") REFERENCES "public"."streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guilds" ADD CONSTRAINT "guilds_twitter_stream_id_fkey" FOREIGN KEY ("twitter_stream_id") REFERENCES "public"."streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streams" ADD CONSTRAINT "streams_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "twitch_streams" ADD CONSTRAINT "twitch_streams_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON DELETE no action ON UPDATE no action;
*/
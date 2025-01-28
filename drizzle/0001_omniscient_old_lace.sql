CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

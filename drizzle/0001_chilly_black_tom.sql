CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"json" jsonb,
	"date" date DEFAULT now() NOT NULL
);

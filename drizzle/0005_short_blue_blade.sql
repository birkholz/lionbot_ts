CREATE TABLE "scenic_rides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"location" text NOT NULL,
	"published_date" date NOT NULL,
	"order" integer NOT NULL
);

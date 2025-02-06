ALTER TABLE "user_avatars" RENAME TO "cyclists";--> statement-breakpoint
ALTER TABLE "cyclists" ADD COLUMN "first_ride" date;--> statement-breakpoint
ALTER TABLE "cyclists" ADD COLUMN "total_rides" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "cyclists" ADD COLUMN "highest_output" integer;
ALTER TABLE "activity_logs" ALTER COLUMN "user_id" SET DATA TYPE uuid;
--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "invited_by" SET DATA TYPE uuid;
--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "user_id" SET DATA TYPE uuid;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "trial_ends_at" timestamp;
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "subscription_ends_at" timestamp;
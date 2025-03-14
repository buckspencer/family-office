-- First, add a UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";--> statement-breakpoint

-- Update the users table first since other tables reference it
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint

-- Now update all the foreign key columns to match
ALTER TABLE "activity_logs" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "assets" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "attachments" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "invited_by" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "user_id" SET DATA TYPE uuid USING (uuid_generate_v4());
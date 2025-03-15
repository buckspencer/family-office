-- Drop the existing activity_logs table if it exists
DROP TABLE IF EXISTS "activity_logs" CASCADE;

-- Create the activity_logs table with all necessary fields
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "user_id" uuid REFERENCES "users"("id"),
  "action" text NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "ip_address" varchar(45),
  "metadata" jsonb,
  CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Create an index on timestamp for faster querying of recent activities
CREATE INDEX IF NOT EXISTS "activity_logs_timestamp_idx" ON "activity_logs" ("timestamp" DESC);

-- Create an index on team_id and timestamp for faster team-specific activity queries
CREATE INDEX IF NOT EXISTS "activity_logs_team_id_timestamp_idx" ON "activity_logs" ("team_id", "timestamp" DESC); 
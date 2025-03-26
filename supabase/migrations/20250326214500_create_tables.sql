-- Drop all existing tables and types
DROP TABLE IF EXISTS "public"."family_ai_chats" CASCADE;
DROP TABLE IF EXISTS "public"."family_dates" CASCADE;
DROP TABLE IF EXISTS "public"."family_documents" CASCADE;
DROP TABLE IF EXISTS "public"."family_information" CASCADE;
DROP TABLE IF EXISTS "public"."family_memories" CASCADE;
DROP TABLE IF EXISTS "public"."family_subscriptions" CASCADE;
DROP TABLE IF EXISTS "public"."family_tasks" CASCADE;
DROP TABLE IF EXISTS "public"."activity_logs" CASCADE;
DROP TABLE IF EXISTS "public"."invitations" CASCADE;
DROP TABLE IF EXISTS "public"."team_members" CASCADE;
DROP TABLE IF EXISTS "public"."teams" CASCADE;
DROP TABLE IF EXISTS "public"."users" CASCADE;

-- Create users table with UUID
CREATE TABLE "public"."users" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" varchar(100),
    "email" varchar(255) NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "role" varchar(20) NOT NULL DEFAULT 'member',
    "email_verified" boolean NOT NULL DEFAULT false,
    "verification_token" text,
    "verification_token_expiry" timestamp,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "deleted_at" timestamp
);

-- Create teams table
CREATE TABLE "public"."teams" (
    "id" serial PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "stripe_customer_id" text UNIQUE,
    "stripe_subscription_id" text UNIQUE,
    "stripe_product_id" text,
    "plan_name" varchar(50),
    "subscription_status" varchar(20)
);

-- Create team_members table
CREATE TABLE "public"."team_members" (
    "id" serial PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES "public"."users"("id"),
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "role" varchar(50) NOT NULL,
    "joined_at" timestamp NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE "public"."activity_logs" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "user_id" uuid REFERENCES "public"."users"("id"),
    "action" text NOT NULL,
    "timestamp" timestamp NOT NULL DEFAULT now(),
    "ip_address" varchar(45)
);

-- Create invitations table
CREATE TABLE "public"."invitations" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "email" varchar(255) NOT NULL,
    "role" varchar(50) NOT NULL,
    "invited_by" uuid NOT NULL REFERENCES "public"."users"("id"),
    "invited_at" timestamp NOT NULL DEFAULT now(),
    "status" varchar(20) NOT NULL DEFAULT 'pending'
);

-- Create family_information table
CREATE TABLE "public"."family_information" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "category" varchar(50) NOT NULL,
    "key" varchar(100) NOT NULL,
    "value" text NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id")
);

-- Create family_dates table
CREATE TABLE "public"."family_dates" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "title" varchar(255) NOT NULL,
    "date" timestamp NOT NULL,
    "type" varchar(50) NOT NULL,
    "description" text,
    "recurring" boolean NOT NULL DEFAULT false,
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id")
);

-- Create family_documents table
CREATE TABLE "public"."family_documents" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "title" varchar(255) NOT NULL,
    "category" varchar(50) NOT NULL,
    "content" text NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id")
);

-- Create family_tasks table
CREATE TABLE "public"."family_tasks" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "title" varchar(255) NOT NULL,
    "description" text,
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "due_date" timestamp,
    "assigned_to" uuid REFERENCES "public"."users"("id"),
    "priority" varchar(20) NOT NULL DEFAULT 'medium',
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id")
);

-- Create family_memories table
CREATE TABLE "public"."family_memories" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "category" varchar(50) NOT NULL,
    "key" varchar(255) NOT NULL,
    "value" text NOT NULL,
    "context" text,
    "last_accessed" timestamp NOT NULL DEFAULT now(),
    "importance" integer NOT NULL DEFAULT 1,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id"),
    "metadata" jsonb
);

-- Create family_subscriptions table
CREATE TABLE "public"."family_subscriptions" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "name" varchar(255) NOT NULL,
    "url" text,
    "monthly_cost" decimal(10,2) NOT NULL,
    "description" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id")
);

-- Create family_ai_chats table
CREATE TABLE "public"."family_ai_chats" (
    "id" serial PRIMARY KEY,
    "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
    "user_id" uuid NOT NULL REFERENCES "public"."users"("id"),
    "message" text NOT NULL,
    "role" varchar(20) NOT NULL,
    "timestamp" timestamp NOT NULL DEFAULT now(),
    "action" jsonb
);

-- Enable RLS on all tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_information" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_dates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_ai_chats" ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view their own profile"
  ON "public"."users"
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON "public"."users"
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for teams
CREATE POLICY "Team members can view their teams"
  ON "public"."teams"
  FOR SELECT
  USING (id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for team_members
CREATE POLICY "Team members can view their team members"
  ON "public"."team_members"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for activity_logs
CREATE POLICY "Team members can view their activity logs"
  ON "public"."activity_logs"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for invitations
CREATE POLICY "Team members can view their invitations"
  ON "public"."invitations"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_information
CREATE POLICY "Family members can view their family information"
  ON "public"."family_information"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family information"
  ON "public"."family_information"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family information"
  ON "public"."family_information"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_dates
CREATE POLICY "Family members can view their family dates"
  ON "public"."family_dates"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family dates"
  ON "public"."family_dates"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family dates"
  ON "public"."family_dates"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_documents
CREATE POLICY "Family members can view their family documents"
  ON "public"."family_documents"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family documents"
  ON "public"."family_documents"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family documents"
  ON "public"."family_documents"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_tasks
CREATE POLICY "Family members can view their family tasks"
  ON "public"."family_tasks"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family tasks"
  ON "public"."family_tasks"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family tasks"
  ON "public"."family_tasks"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_memories
CREATE POLICY "Family members can view their family memories"
  ON "public"."family_memories"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family memories"
  ON "public"."family_memories"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family memories"
  ON "public"."family_memories"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_subscriptions
CREATE POLICY "Family members can view their family subscriptions"
  ON "public"."family_subscriptions"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family subscriptions"
  ON "public"."family_subscriptions"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family subscriptions"
  ON "public"."family_subscriptions"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_ai_chats
CREATE POLICY "Family members can view their family AI chats"
  ON "public"."family_ai_chats"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family AI chats"
  ON "public"."family_ai_chats"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Add delete policies for all tables
CREATE POLICY "Family owners can delete family information"
  ON "public"."family_information"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family dates"
  ON "public"."family_dates"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family documents"
  ON "public"."family_documents"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family tasks"
  ON "public"."family_tasks"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family memories"
  ON "public"."family_memories"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family subscriptions"
  ON "public"."family_subscriptions"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family AI chats"
  ON "public"."family_ai_chats"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  )); 
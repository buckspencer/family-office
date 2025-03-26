-- Create family information table
CREATE TABLE IF NOT EXISTS "family_information" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "category" varchar(50) NOT NULL,
  "key" varchar(100) NOT NULL,
  "value" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_by" integer NOT NULL,
  CONSTRAINT "family_information_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_information_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

-- Create family dates table
CREATE TABLE IF NOT EXISTS "family_dates" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "date" timestamp NOT NULL,
  "type" varchar(50) NOT NULL,
  "description" text,
  "recurring" boolean DEFAULT false NOT NULL,
  "created_by" integer NOT NULL,
  CONSTRAINT "family_dates_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_dates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

-- Create family documents table
CREATE TABLE IF NOT EXISTS "family_documents" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "category" varchar(50) NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_by" integer NOT NULL,
  CONSTRAINT "family_documents_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

-- Create family tasks table
CREATE TABLE IF NOT EXISTS "family_tasks" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "due_date" timestamp,
  "assigned_to" integer,
  "priority" varchar(20) DEFAULT 'medium' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_by" integer NOT NULL,
  CONSTRAINT "family_tasks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id"),
  CONSTRAINT "family_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

-- Create family memories table
CREATE TABLE IF NOT EXISTS "family_memories" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "category" varchar(50) NOT NULL,
  "key" varchar(255) NOT NULL,
  "value" text NOT NULL,
  "context" text,
  "last_accessed" timestamp DEFAULT now() NOT NULL,
  "importance" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_by" integer NOT NULL,
  "metadata" jsonb,
  CONSTRAINT "family_memories_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_memories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

-- Create family subscriptions table
CREATE TABLE IF NOT EXISTS "family_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "url" text,
  "monthly_cost" decimal(10,2) NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_by" integer NOT NULL,
  CONSTRAINT "family_subscriptions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_subscriptions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

-- Create family AI chats table
CREATE TABLE IF NOT EXISTS "family_ai_chats" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "message" text NOT NULL,
  "role" varchar(20) NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "action" jsonb,
  CONSTRAINT "family_ai_chats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id"),
  CONSTRAINT "family_ai_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

-- Enable RLS on all tables
ALTER TABLE "family_information" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_dates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "family_ai_chats" ENABLE ROW LEVEL SECURITY;

-- Create policies for family_information
CREATE POLICY "Family members can view their family information"
  ON "family_information"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family information"
  ON "family_information"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family information"
  ON "family_information"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_dates
CREATE POLICY "Family members can view their family dates"
  ON "family_dates"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family dates"
  ON "family_dates"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family dates"
  ON "family_dates"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_documents
CREATE POLICY "Family members can view their family documents"
  ON "family_documents"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family documents"
  ON "family_documents"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family documents"
  ON "family_documents"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_tasks
CREATE POLICY "Family members can view their family tasks"
  ON "family_tasks"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family tasks"
  ON "family_tasks"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family tasks"
  ON "family_tasks"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_memories
CREATE POLICY "Family members can view their family memories"
  ON "family_memories"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family memories"
  ON "family_memories"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family memories"
  ON "family_memories"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_subscriptions
CREATE POLICY "Family members can view their family subscriptions"
  ON "family_subscriptions"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family subscriptions"
  ON "family_subscriptions"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can update their family subscriptions"
  ON "family_subscriptions"
  FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Create policies for family_ai_chats
CREATE POLICY "Family members can view their family AI chats"
  ON "family_ai_chats"
  FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Family members can create family AI chats"
  ON "family_ai_chats"
  FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

-- Add delete policies for all tables
CREATE POLICY "Family owners can delete family information"
  ON "family_information"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family dates"
  ON "family_dates"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family documents"
  ON "family_documents"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family tasks"
  ON "family_tasks"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family memories"
  ON "family_memories"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family subscriptions"
  ON "family_subscriptions"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Family owners can delete family AI chats"
  ON "family_ai_chats"
  FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'owner'
  )); 
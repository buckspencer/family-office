-- Enable RLS on all tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_ai_chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_information" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_dates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_events" ENABLE ROW LEVEL SECURITY;

-- Create indexes for frequently queried columns
CREATE INDEX "idx_users_email" ON "public"."users" ("email");
CREATE INDEX "idx_users_deleted_at" ON "public"."users" ("deleted_at");
CREATE INDEX "idx_teams_stripe_customer_id" ON "public"."teams" ("stripe_customer_id");
CREATE INDEX "idx_teams_stripe_subscription_id" ON "public"."teams" ("stripe_subscription_id");
CREATE INDEX "idx_teams_deleted_at" ON "public"."teams" ("deleted_at");
CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" ("user_id");
CREATE INDEX "idx_team_members_team_id" ON "public"."team_members" ("team_id");
CREATE INDEX "idx_team_members_deleted_at" ON "public"."team_members" ("deleted_at");
CREATE INDEX "idx_activity_logs_team_id" ON "public"."activity_logs" ("team_id");
CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs" ("user_id");
CREATE INDEX "idx_activity_logs_timestamp" ON "public"."activity_logs" ("timestamp");
CREATE INDEX "idx_invitations_team_id" ON "public"."invitations" ("team_id");
CREATE INDEX "idx_invitations_email" ON "public"."invitations" ("email");
CREATE INDEX "idx_invitations_status" ON "public"."invitations" ("status");
CREATE INDEX "idx_invitations_deleted_at" ON "public"."invitations" ("deleted_at");
CREATE INDEX "idx_family_subscriptions_team_id" ON "public"."family_subscriptions" ("team_id");
CREATE INDEX "idx_family_subscriptions_deleted_at" ON "public"."family_subscriptions" ("deleted_at");
CREATE INDEX "idx_family_ai_chats_team_id" ON "public"."family_ai_chats" ("team_id");
CREATE INDEX "idx_family_ai_chats_user_id" ON "public"."family_ai_chats" ("user_id");
CREATE INDEX "idx_family_ai_chats_timestamp" ON "public"."family_ai_chats" ("timestamp");
CREATE INDEX "idx_family_ai_chats_deleted_at" ON "public"."family_ai_chats" ("deleted_at");
CREATE INDEX "idx_family_memories_team_id" ON "public"."family_memories" ("team_id");
CREATE INDEX "idx_family_memories_category" ON "public"."family_memories" ("category");
CREATE INDEX "idx_family_memories_key" ON "public"."family_memories" ("key");
CREATE INDEX "idx_family_memories_deleted_at" ON "public"."family_memories" ("deleted_at");
CREATE INDEX "idx_family_information_team_id" ON "public"."family_information" ("team_id");
CREATE INDEX "idx_family_information_category" ON "public"."family_information" ("category");
CREATE INDEX "idx_family_information_key" ON "public"."family_information" ("key");
CREATE INDEX "idx_family_information_deleted_at" ON "public"."family_information" ("deleted_at");
CREATE INDEX "idx_family_dates_team_id" ON "public"."family_dates" ("team_id");
CREATE INDEX "idx_family_dates_date" ON "public"."family_dates" ("date");
CREATE INDEX "idx_family_dates_type" ON "public"."family_dates" ("type");
CREATE INDEX "idx_family_dates_deleted_at" ON "public"."family_dates" ("deleted_at");
CREATE INDEX "idx_family_tasks_team_id" ON "public"."family_tasks" ("team_id");
CREATE INDEX "idx_family_tasks_assigned_to" ON "public"."family_tasks" ("assigned_to");
CREATE INDEX "idx_family_tasks_status" ON "public"."family_tasks" ("status");
CREATE INDEX "idx_family_tasks_priority" ON "public"."family_tasks" ("priority");
CREATE INDEX "idx_family_tasks_deleted_at" ON "public"."family_tasks" ("deleted_at");
CREATE INDEX "idx_family_documents_team_id" ON "public"."family_documents" ("team_id");
CREATE INDEX "idx_family_documents_type" ON "public"."family_documents" ("type");
CREATE INDEX "idx_family_documents_status" ON "public"."family_documents" ("status");
CREATE INDEX "idx_family_documents_deleted_at" ON "public"."family_documents" ("deleted_at");
CREATE INDEX "idx_family_events_team_id" ON "public"."family_events" ("team_id");
CREATE INDEX "idx_family_events_start_date" ON "public"."family_events" ("start_date");
CREATE INDEX "idx_family_events_status" ON "public"."family_events" ("status");
CREATE INDEX "idx_family_events_deleted_at" ON "public"."family_events" ("deleted_at");

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile"
ON "public"."users"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON "public"."users"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Team members can view their teams"
ON "public"."teams"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "teams"."id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team owners can update their teams"
ON "public"."teams"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "teams"."id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "teams"."id"
    AND "team_members"."user_id" = auth.uid()
    AND "team_members"."role" = 'owner'
  )
);

-- Team members policies
CREATE POLICY "Team members can view their team members"
ON "public"."team_members"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members" AS tm
    WHERE tm.team_id = "team_members"."team_id"
    AND tm.user_id = auth.uid()
  )
);

-- Activity logs policies
CREATE POLICY "Team members can view their activity logs"
ON "public"."activity_logs"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "activity_logs"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Invitations policies
CREATE POLICY "Team members can view their invitations"
ON "public"."invitations"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "invitations"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family subscriptions policies
CREATE POLICY "Team members can view their family subscriptions"
ON "public"."family_subscriptions"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_subscriptions"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family subscriptions"
ON "public"."family_subscriptions"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_subscriptions"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family AI chats policies
CREATE POLICY "Team members can view their family AI chats"
ON "public"."family_ai_chats"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_ai_chats"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family AI chats"
ON "public"."family_ai_chats"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_ai_chats"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family memories policies
CREATE POLICY "Team members can view their family memories"
ON "public"."family_memories"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_memories"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family memories"
ON "public"."family_memories"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_memories"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family information policies
CREATE POLICY "Team members can view their family information"
ON "public"."family_information"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_information"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family information"
ON "public"."family_information"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_information"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family dates policies
CREATE POLICY "Team members can view their family dates"
ON "public"."family_dates"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_dates"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family dates"
ON "public"."family_dates"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_dates"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family tasks policies
CREATE POLICY "Team members can view their family tasks"
ON "public"."family_tasks"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_tasks"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family tasks"
ON "public"."family_tasks"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_tasks"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family documents policies
CREATE POLICY "Team members can view their family documents"
ON "public"."family_documents"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_documents"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family documents"
ON "public"."family_documents"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_documents"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

-- Family events policies
CREATE POLICY "Team members can view their family events"
ON "public"."family_events"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_events"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
);

CREATE POLICY "Team members can create family events"
ON "public"."family_events"
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."team_members"
    WHERE "team_members"."team_id" = "family_events"."team_id"
    AND "team_members"."user_id" = auth.uid()
  )
); 
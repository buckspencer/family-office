-- Create custom types
CREATE TYPE "public"."document_status" AS ENUM('draft', 'active', 'archived', 'deleted');
CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'member', 'guest');

-- Create tables
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" varchar(255) NOT NULL,
    "name" varchar(255),
    "role" user_role NOT NULL DEFAULT 'member',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid,
    "updated_by" uuid,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "users_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."teams" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar(255) NOT NULL,
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid,
    "updated_by" uuid,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teams_name_key" UNIQUE ("name"),
    CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "teams_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."team_members" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" user_role NOT NULL DEFAULT 'member',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid,
    "updated_by" uuid,
    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "team_members_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "team_members_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id"),
    CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id")
);

CREATE TABLE "public"."family_documents" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "content" text,
    "status" document_status NOT NULL DEFAULT 'draft',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_documents_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_documents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."family_tasks" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "status" task_status NOT NULL DEFAULT 'pending',
    "priority" task_priority NOT NULL DEFAULT 'medium',
    "due_date" timestamp,
    "assigned_to" uuid NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_tasks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_tasks_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."family_events" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "start_date" timestamp NOT NULL,
    "end_date" timestamp,
    "status" event_status NOT NULL DEFAULT 'scheduled',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_events_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_events_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."family_dates" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "date" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_dates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_dates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_dates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_dates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."family_memories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "date" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_memories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_memories_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_memories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_memories_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."family_information" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_information_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_information_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_information_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_information_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."family_subscriptions" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "description" text,
    "amount" decimal(10,2) NOT NULL,
    "frequency" varchar(50) NOT NULL,
    "next_billing_date" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    "created_by" uuid NOT NULL,
    "updated_by" uuid,
    CONSTRAINT "family_subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_subscriptions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_subscriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "family_subscriptions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id")
);

CREATE TABLE "public"."activity_logs" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "action" varchar(255) NOT NULL,
    "details" text,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."family_ai_chats" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "message" text NOT NULL,
    "response" text,
    "role" text NOT NULL,
    "action" jsonb,
    "status" text DEFAULT 'pending',
    "error" text,
    "timestamp" timestamp NOT NULL DEFAULT now(),
    "deleted_at" timestamp,
    CONSTRAINT "family_ai_chats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "family_ai_chats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "family_ai_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

CREATE TABLE "public"."invitations" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "team_id" uuid NOT NULL,
    "email" varchar(255) NOT NULL,
    "role" user_role NOT NULL DEFAULT 'member',
    "token" varchar(255) NOT NULL,
    "invited_by" uuid NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp,
    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE,
    CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "invitations_token_key" UNIQUE ("token")
);

-- Create indexes
CREATE INDEX "idx_users_email" ON "public"."users" ("email");
CREATE INDEX "idx_users_deleted_at" ON "public"."users" ("deleted_at");
CREATE INDEX "idx_teams_name" ON "public"."teams" ("name");
CREATE INDEX "idx_teams_deleted_at" ON "public"."teams" ("deleted_at");
CREATE INDEX "idx_team_members_team_id" ON "public"."team_members" ("team_id");
CREATE INDEX "idx_team_members_user_id" ON "public"."team_members" ("user_id");
CREATE INDEX "idx_team_members_deleted_at" ON "public"."team_members" ("deleted_at");
CREATE INDEX "idx_family_documents_team_id" ON "public"."family_documents" ("team_id");
CREATE INDEX "idx_family_documents_status" ON "public"."family_documents" ("status");
CREATE INDEX "idx_family_documents_deleted_at" ON "public"."family_documents" ("deleted_at");
CREATE INDEX "idx_family_tasks_team_id" ON "public"."family_tasks" ("team_id");
CREATE INDEX "idx_family_tasks_status" ON "public"."family_tasks" ("status");
CREATE INDEX "idx_family_tasks_assigned_to" ON "public"."family_tasks" ("assigned_to");
CREATE INDEX "idx_family_tasks_deleted_at" ON "public"."family_tasks" ("deleted_at");
CREATE INDEX "idx_family_events_team_id" ON "public"."family_events" ("team_id");
CREATE INDEX "idx_family_events_status" ON "public"."family_events" ("status");
CREATE INDEX "idx_family_events_deleted_at" ON "public"."family_events" ("deleted_at");
CREATE INDEX "idx_family_dates_team_id" ON "public"."family_dates" ("team_id");
CREATE INDEX "idx_family_dates_date" ON "public"."family_dates" ("date");
CREATE INDEX "idx_family_dates_deleted_at" ON "public"."family_dates" ("deleted_at");
CREATE INDEX "idx_family_memories_team_id" ON "public"."family_memories" ("team_id");
CREATE INDEX "idx_family_memories_date" ON "public"."family_memories" ("date");
CREATE INDEX "idx_family_memories_deleted_at" ON "public"."family_memories" ("deleted_at");
CREATE INDEX "idx_family_information_team_id" ON "public"."family_information" ("team_id");
CREATE INDEX "idx_family_information_deleted_at" ON "public"."family_information" ("deleted_at");
CREATE INDEX "idx_family_subscriptions_team_id" ON "public"."family_subscriptions" ("team_id");
CREATE INDEX "idx_family_subscriptions_deleted_at" ON "public"."family_subscriptions" ("deleted_at");
CREATE INDEX "idx_activity_logs_team_id" ON "public"."activity_logs" ("team_id");
CREATE INDEX "idx_activity_logs_user_id" ON "public"."activity_logs" ("user_id");
CREATE INDEX "idx_family_ai_chats_team_id" ON "public"."family_ai_chats" ("team_id");
CREATE INDEX "idx_family_ai_chats_user_id" ON "public"."family_ai_chats" ("user_id");
CREATE INDEX "idx_family_ai_chats_deleted_at" ON "public"."family_ai_chats" ("deleted_at");
CREATE INDEX "idx_invitations_team_id" ON "public"."invitations" ("team_id");
CREATE INDEX "idx_invitations_email" ON "public"."invitations" ("email");
CREATE INDEX "idx_invitations_token" ON "public"."invitations" ("token");
CREATE INDEX "idx_invitations_deleted_at" ON "public"."invitations" ("deleted_at");

-- Enable Row Level Security
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_dates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_memories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_information" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."family_ai_chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON "public"."users"
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON "public"."users"
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Team members can view team data" ON "public"."teams"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team admins can update team data" ON "public"."teams"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = teams.id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can view team member data" ON "public"."team_members"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members" AS tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.deleted_at IS NULL
        )
    );

CREATE POLICY "Team admins can manage team members" ON "public"."team_members"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members" AS tm
            WHERE tm.team_id = team_members.team_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('owner', 'admin')
            AND tm.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can view family documents" ON "public"."family_documents"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_documents.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family documents" ON "public"."family_documents"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_documents.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own documents" ON "public"."family_documents"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_documents.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_documents.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own documents" ON "public"."family_documents"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_documents.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_documents.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view family tasks" ON "public"."family_tasks"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_tasks.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family tasks" ON "public"."family_tasks"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_tasks.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own tasks" ON "public"."family_tasks"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_tasks.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR assigned_to = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_tasks.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own tasks" ON "public"."family_tasks"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_tasks.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_tasks.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view family events" ON "public"."family_events"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_events.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family events" ON "public"."family_events"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_events.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own events" ON "public"."family_events"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_events.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_events.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own events" ON "public"."family_events"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_events.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_events.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view family dates" ON "public"."family_dates"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_dates.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family dates" ON "public"."family_dates"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_dates.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own dates" ON "public"."family_dates"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_dates.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_dates.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own dates" ON "public"."family_dates"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_dates.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_dates.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view family memories" ON "public"."family_memories"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_memories.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family memories" ON "public"."family_memories"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_memories.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own memories" ON "public"."family_memories"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_memories.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_memories.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own memories" ON "public"."family_memories"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_memories.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_memories.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view family information" ON "public"."family_information"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_information.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family information" ON "public"."family_information"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_information.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own information" ON "public"."family_information"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_information.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_information.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own information" ON "public"."family_information"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_information.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_information.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view family subscriptions" ON "public"."family_subscriptions"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_subscriptions.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create family subscriptions" ON "public"."family_subscriptions"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_subscriptions.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own subscriptions" ON "public"."family_subscriptions"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_subscriptions.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_subscriptions.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can delete their own subscriptions" ON "public"."family_subscriptions"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_subscriptions.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_subscriptions.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        ))
    );

CREATE POLICY "Team members can view activity logs" ON "public"."activity_logs"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = activity_logs.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can view AI chats" ON "public"."family_ai_chats"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_ai_chats.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can create AI chats" ON "public"."family_ai_chats"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_ai_chats.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team members can update their own AI chats" ON "public"."family_ai_chats"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_ai_chats.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Team members can delete their own AI chats" ON "public"."family_ai_chats"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = family_ai_chats.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Team members can view invitations" ON "public"."invitations"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = invitations.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team admins can create invitations" ON "public"."invitations"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = invitations.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team admins can update invitations" ON "public"."invitations"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = invitations.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        )
    );

CREATE POLICY "Team admins can delete invitations" ON "public"."invitations"
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM "public"."team_members"
            WHERE team_members.team_id = invitations.team_id
            AND team_members.user_id = auth.uid()
            AND team_members.role IN ('owner', 'admin')
            AND team_members.deleted_at IS NULL
        )
    ); 
create schema if not exists "drizzle";

create sequence "drizzle"."__drizzle_migrations_id_seq";

create table "drizzle"."__drizzle_migrations" (
    "id" integer not null default nextval('drizzle.__drizzle_migrations_id_seq'::regclass),
    "hash" text not null,
    "created_at" bigint
);

alter sequence "drizzle"."__drizzle_migrations_id_seq" owned by "drizzle"."__drizzle_migrations"."id";

CREATE UNIQUE INDEX __drizzle_migrations_pkey ON drizzle.__drizzle_migrations USING btree (id);

alter table "drizzle"."__drizzle_migrations" add constraint "__drizzle_migrations_pkey" PRIMARY KEY using index "__drizzle_migrations_pkey";

-- Drop existing policies
drop policy if exists "Team members can view activity logs" on "public"."activity_logs";
drop policy if exists "Team members can create AI chats" on "public"."family_ai_chats";
drop policy if exists "Team members can delete their own AI chats" on "public"."family_ai_chats";
drop policy if exists "Team members can update their own AI chats" on "public"."family_ai_chats";
drop policy if exists "Team members can view AI chats" on "public"."family_ai_chats";
drop policy if exists "Team members can create family dates" on "public"."family_dates";
drop policy if exists "Team members can delete their own dates" on "public"."family_dates";
drop policy if exists "Team members can update their own dates" on "public"."family_dates";
drop policy if exists "Team members can view family dates" on "public"."family_dates";
drop policy if exists "Team members can create family documents" on "public"."family_documents";
drop policy if exists "Team members can delete their own documents" on "public"."family_documents";
drop policy if exists "Team members can update their own documents" on "public"."family_documents";
drop policy if exists "Team members can view family documents" on "public"."family_documents";
drop policy if exists "Team members can create family events" on "public"."family_events";
drop policy if exists "Team members can delete their own events" on "public"."family_events";
drop policy if exists "Team members can update their own events" on "public"."family_events";
drop policy if exists "Team members can view family events" on "public"."family_events";
drop policy if exists "Team members can create family information" on "public"."family_information";
drop policy if exists "Team members can delete their own information" on "public"."family_information";
drop policy if exists "Team members can update their own information" on "public"."family_information";
drop policy if exists "Team members can view family information" on "public"."family_information";
drop policy if exists "Team members can create family memories" on "public"."family_memories";
drop policy if exists "Team members can delete their own memories" on "public"."family_memories";
drop policy if exists "Team members can update their own memories" on "public"."family_memories";
drop policy if exists "Team members can view family memories" on "public"."family_memories";
drop policy if exists "Team members can create family subscriptions" on "public"."family_subscriptions";
drop policy if exists "Team members can delete their own subscriptions" on "public"."family_subscriptions";
drop policy if exists "Team members can update their own subscriptions" on "public"."family_subscriptions";
drop policy if exists "Team members can view family subscriptions" on "public"."family_subscriptions";
drop policy if exists "Team members can create family tasks" on "public"."family_tasks";
drop policy if exists "Team members can delete their own tasks" on "public"."family_tasks";
drop policy if exists "Team members can update their own tasks" on "public"."family_tasks";
drop policy if exists "Team members can view family tasks" on "public"."family_tasks";
drop policy if exists "Team admins can create invitations" on "public"."invitations";
drop policy if exists "Team admins can delete invitations" on "public"."invitations";
drop policy if exists "Team admins can update invitations" on "public"."invitations";
drop policy if exists "Team members can view invitations" on "public"."invitations";
drop policy if exists "Team admins can manage team members" on "public"."team_members";
drop policy if exists "Team members can view team member data" on "public"."team_members";
drop policy if exists "Team admins can update team data" on "public"."teams";
drop policy if exists "Team members can view team data" on "public"."teams";
drop policy if exists "Users can update their own data" on "public"."users";
drop policy if exists "Users can view their own data" on "public"."users";

-- Revoke permissions
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
revoke all on all tables in schema public from service_role;

-- Enable RLS
alter table "public"."activity_logs" enable row level security;
alter table "public"."family_ai_chats" enable row level security;
alter table "public"."family_dates" enable row level security;
alter table "public"."family_documents" enable row level security;
alter table "public"."family_events" enable row level security;
alter table "public"."family_information" enable row level security;
alter table "public"."family_memories" enable row level security;
alter table "public"."family_subscriptions" enable row level security;
alter table "public"."family_tasks" enable row level security;
alter table "public"."invitations" enable row level security;
alter table "public"."team_members" enable row level security;
alter table "public"."teams" enable row level security;
alter table "public"."users" enable row level security;

-- Create policies
create policy "Team members can view activity logs"
    on "public"."activity_logs"
    for select
    to authenticated
    using (
        exists (
            select 1 from "public"."team_members"
            where "team_members"."team_id" = "activity_logs"."team_id"
            and "team_members"."user_id" = auth.uid()
        )
    );

create policy "Team members can create AI chats"
    on "public"."family_ai_chats"
    for insert
    to authenticated
    with check (
        exists (
            select 1 from "public"."team_members"
            where "team_members"."team_id" = "family_ai_chats"."team_id"
            and "team_members"."user_id" = auth.uid()
        )
    );

create policy "Team members can update their own AI chats"
    on "public"."family_ai_chats"
    for update
    to authenticated
    using (
        exists (
            select 1 from "public"."team_members"
            where "team_members"."team_id" = "family_ai_chats"."team_id"
            and "team_members"."user_id" = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from "public"."team_members"
            where "team_members"."team_id" = "family_ai_chats"."team_id"
            and "team_members"."user_id" = auth.uid()
        )
    );

create policy "Team members can delete their own AI chats"
    on "public"."family_ai_chats"
    for delete
    to authenticated
    using (
        exists (
            select 1 from "public"."team_members"
            where "team_members"."team_id" = "family_ai_chats"."team_id"
            and "team_members"."user_id" = auth.uid()
        )
    );

create policy "Team members can view AI chats"
    on "public"."family_ai_chats"
    for select
    to authenticated
    using (
        exists (
            select 1 from "public"."team_members"
            where "team_members"."team_id" = "family_ai_chats"."team_id"
            and "team_members"."user_id" = auth.uid()
        )
    );

create sequence "public"."activity_logs_id_seq";

create sequence "public"."family_ai_chats_id_seq";

create sequence "public"."family_dates_id_seq";

create sequence "public"."family_documents_id_seq";

create sequence "public"."family_events_id_seq";

create sequence "public"."family_information_id_seq";

create sequence "public"."family_memories_id_seq";

create sequence "public"."family_subscriptions_id_seq";

create sequence "public"."family_tasks_id_seq";

create sequence "public"."invitations_id_seq";

create sequence "public"."team_members_id_seq";

create sequence "public"."teams_id_seq";

create schema if not exists "tap";



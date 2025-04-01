create type "public"."activity_type" as enum ('SIGN_IN', 'SIGN_OUT', 'SIGN_UP', 'CREATE_TEAM', 'ACCEPT_INVITATION', 'UPDATE_PROFILE', 'UPDATE_PASSWORD', 'VERIFY_EMAIL', 'RESET_PASSWORD', 'DELETE_ACCOUNT', 'REMOVE_TEAM_MEMBER', 'INVITE_TEAM_MEMBER', 'UPDATE_ACCOUNT');

create sequence "public"."action_logs_id_seq";

drop policy "Team members can view activity logs" on "public"."activity_logs";

drop policy "Team members can create AI chats" on "public"."family_ai_chats";

drop policy "Team members can delete their own AI chats" on "public"."family_ai_chats";

drop policy "Team members can update their own AI chats" on "public"."family_ai_chats";

drop policy "Team members can view AI chats" on "public"."family_ai_chats";

alter table "public"."invitations" drop constraint "invitations_token_key";

alter table "public"."team_members" drop constraint "team_members_team_id_user_id_key";

alter table "public"."teams" drop constraint "teams_name_key";

alter table "public"."users" drop constraint "users_email_key";

drop index if exists "public"."idx_activity_logs_team_id";

drop index if exists "public"."idx_activity_logs_user_id";

drop index if exists "public"."idx_family_ai_chats_deleted_at";

drop index if exists "public"."idx_family_ai_chats_team_id";

drop index if exists "public"."idx_family_ai_chats_user_id";

drop index if exists "public"."idx_family_dates_date";

drop index if exists "public"."idx_family_dates_deleted_at";

drop index if exists "public"."idx_family_dates_team_id";

drop index if exists "public"."idx_family_documents_deleted_at";

drop index if exists "public"."idx_family_documents_status";

drop index if exists "public"."idx_family_documents_team_id";

drop index if exists "public"."idx_family_events_deleted_at";

drop index if exists "public"."idx_family_events_status";

drop index if exists "public"."idx_family_events_team_id";

drop index if exists "public"."idx_family_information_deleted_at";

drop index if exists "public"."idx_family_information_team_id";

drop index if exists "public"."idx_family_memories_date";

drop index if exists "public"."idx_family_memories_deleted_at";

drop index if exists "public"."idx_family_memories_team_id";

drop index if exists "public"."idx_family_subscriptions_deleted_at";

drop index if exists "public"."idx_family_subscriptions_team_id";

drop index if exists "public"."idx_family_tasks_assigned_to";

drop index if exists "public"."idx_family_tasks_deleted_at";

drop index if exists "public"."idx_family_tasks_status";

drop index if exists "public"."idx_family_tasks_team_id";

drop index if exists "public"."idx_invitations_deleted_at";

drop index if exists "public"."idx_invitations_email";

drop index if exists "public"."idx_invitations_team_id";

drop index if exists "public"."idx_invitations_token";

drop index if exists "public"."idx_team_members_deleted_at";

drop index if exists "public"."idx_team_members_team_id";

drop index if exists "public"."idx_team_members_user_id";

drop index if exists "public"."idx_teams_deleted_at";

drop index if exists "public"."idx_teams_name";

drop index if exists "public"."idx_users_deleted_at";

drop index if exists "public"."idx_users_email";

drop index if exists "public"."invitations_token_key";

drop index if exists "public"."team_members_team_id_user_id_key";

drop index if exists "public"."teams_name_key";

drop index if exists "public"."users_email_key";

create table "public"."action_logs" (
    "id" integer not null default nextval('action_logs_id_seq'::regclass),
    "team_id" integer not null,
    "user_id" uuid not null,
    "action_type" character varying(50) not null,
    "action_data" jsonb not null,
    "status" character varying(20) not null default 'pending'::character varying,
    "created_at" timestamp without time zone not null default now(),
    "executed_at" timestamp without time zone,
    "error" text,
    "metadata" jsonb
);


alter table "public"."activity_logs" drop column "created_at";

alter table "public"."activity_logs" drop column "details";

alter table "public"."activity_logs" add column "ip_address" character varying(45);

alter table "public"."activity_logs" add column "timestamp" timestamp without time zone not null default now();

alter table "public"."activity_logs" alter column "action" set data type text using "action"::text;

alter table "public"."activity_logs" alter column "id" set default nextval('activity_logs_id_seq'::regclass);

alter table "public"."activity_logs" alter column "id" set data type integer using "id"::integer;

alter table "public"."activity_logs" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."activity_logs" disable row level security;

alter table "public"."family_ai_chats" alter column "id" set default nextval('family_ai_chats_id_seq'::regclass);

alter table "public"."family_ai_chats" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_ai_chats" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_ai_chats" disable row level security;

alter table "public"."family_dates" add column "recurring" boolean not null default false;

alter table "public"."family_dates" add column "type" character varying(50) not null;

alter table "public"."family_dates" alter column "id" set default nextval('family_dates_id_seq'::regclass);

alter table "public"."family_dates" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_dates" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_dates" disable row level security;

alter table "public"."family_documents" alter column "id" set default nextval('family_documents_id_seq'::regclass);

alter table "public"."family_documents" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_documents" alter column "status" set default 'draft'::text;

alter table "public"."family_documents" alter column "status" set data type text using "status"::text;

alter table "public"."family_documents" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_documents" disable row level security;

alter table "public"."family_events" alter column "end_date" set not null;

alter table "public"."family_events" alter column "id" set default nextval('family_events_id_seq'::regclass);

alter table "public"."family_events" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_events" alter column "status" set default 'scheduled'::character varying;

alter table "public"."family_events" alter column "status" set data type text using "status"::text;

alter table "public"."family_events" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_events" disable row level security;

alter table "public"."family_information" drop column "content";

alter table "public"."family_information" drop column "title";

alter table "public"."family_information" add column "category" character varying(50) not null;

alter table "public"."family_information" add column "key" character varying(100) not null;

alter table "public"."family_information" add column "value" text not null;

alter table "public"."family_information" alter column "id" set default nextval('family_information_id_seq'::regclass);

alter table "public"."family_information" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_information" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_information" disable row level security;

alter table "public"."family_memories" drop column "date";

alter table "public"."family_memories" drop column "description";

alter table "public"."family_memories" drop column "title";

alter table "public"."family_memories" add column "category" character varying(50) not null;

alter table "public"."family_memories" add column "context" text;

alter table "public"."family_memories" add column "importance" integer not null default 1;

alter table "public"."family_memories" add column "key" character varying(255) not null;

alter table "public"."family_memories" add column "last_accessed" timestamp without time zone not null default now();

alter table "public"."family_memories" add column "metadata" jsonb;

alter table "public"."family_memories" add column "value" text not null;

alter table "public"."family_memories" alter column "id" set default nextval('family_memories_id_seq'::regclass);

alter table "public"."family_memories" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_memories" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_memories" disable row level security;

alter table "public"."family_subscriptions" drop column "amount";

alter table "public"."family_subscriptions" drop column "frequency";

alter table "public"."family_subscriptions" drop column "next_billing_date";

alter table "public"."family_subscriptions" drop column "title";

alter table "public"."family_subscriptions" add column "monthly_cost" numeric(10,2) not null;

alter table "public"."family_subscriptions" add column "name" character varying(255) not null;

alter table "public"."family_subscriptions" add column "url" text;

alter table "public"."family_subscriptions" alter column "id" set default nextval('family_subscriptions_id_seq'::regclass);

alter table "public"."family_subscriptions" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_subscriptions" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_subscriptions" disable row level security;

alter table "public"."family_tasks" alter column "id" set default nextval('family_tasks_id_seq'::regclass);

alter table "public"."family_tasks" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_tasks" alter column "priority" set default 'medium'::text;

alter table "public"."family_tasks" alter column "priority" set data type text using "priority"::text;

alter table "public"."family_tasks" alter column "status" set default 'pending'::character varying;

alter table "public"."family_tasks" alter column "status" set data type text using "status"::text;

alter table "public"."family_tasks" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_tasks" disable row level security;

alter table "public"."invitations" drop column "token";

alter table "public"."invitations" add column "invited_at" timestamp without time zone not null default now();

alter table "public"."invitations" add column "status" character varying(20) not null default 'pending'::character varying;

alter table "public"."invitations" alter column "id" set default nextval('invitations_id_seq'::regclass);

alter table "public"."invitations" alter column "id" set data type integer using "id"::integer;

alter table "public"."invitations" alter column "role" drop default;

alter table "public"."invitations" alter column "role" set data type text using "role"::text;

alter table "public"."invitations" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."invitations" disable row level security;

alter table "public"."team_members" alter column "id" set default nextval('team_members_id_seq'::regclass);

alter table "public"."team_members" alter column "id" set data type integer using "id"::integer;

alter table "public"."team_members" alter column "role" drop default;

alter table "public"."team_members" alter column "role" set data type text using "role"::text;

alter table "public"."team_members" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."team_members" disable row level security;

alter table "public"."teams" drop column "description";

alter table "public"."teams" add column "plan_name" character varying(50);

alter table "public"."teams" add column "stripe_customer_id" text;

alter table "public"."teams" add column "stripe_product_id" text;

alter table "public"."teams" add column "stripe_subscription_id" text;

alter table "public"."teams" add column "subscription_ends_at" timestamp without time zone;

alter table "public"."teams" add column "subscription_status" character varying(20);

alter table "public"."teams" add column "trial_ends_at" timestamp without time zone;

alter table "public"."teams" alter column "id" set default nextval('teams_id_seq'::regclass);

alter table "public"."teams" alter column "id" set data type integer using "id"::integer;

alter table "public"."teams" alter column "name" set data type character varying(100) using "name"::character varying(100);

alter table "public"."teams" disable row level security;

alter table "public"."users" add column "email_verified" boolean not null default false;

alter table "public"."users" add column "password_hash" text not null;

alter table "public"."users" add column "verification_token" text;

alter table "public"."users" add column "verification_token_expiry" timestamp without time zone;

alter table "public"."users" alter column "name" set data type character varying(100) using "name"::character varying(100);

alter table "public"."users" alter column "role" set default 'member'::character varying;

alter table "public"."users" alter column "role" set data type text using "role"::text;

alter table "public"."users" disable row level security;

alter sequence "public"."action_logs_id_seq" owned by "public"."action_logs"."id";

alter sequence "public"."activity_logs_id_seq" owned by "public"."activity_logs"."id";

alter sequence "public"."family_ai_chats_id_seq" owned by "public"."family_ai_chats"."id";

alter sequence "public"."family_dates_id_seq" owned by "public"."family_dates"."id";

alter sequence "public"."family_documents_id_seq" owned by "public"."family_documents"."id";

alter sequence "public"."family_events_id_seq" owned by "public"."family_events"."id";

alter sequence "public"."family_information_id_seq" owned by "public"."family_information"."id";

alter sequence "public"."family_memories_id_seq" owned by "public"."family_memories"."id";

alter sequence "public"."family_subscriptions_id_seq" owned by "public"."family_subscriptions"."id";

alter sequence "public"."family_tasks_id_seq" owned by "public"."family_tasks"."id";

alter sequence "public"."invitations_id_seq" owned by "public"."invitations"."id";

alter sequence "public"."team_members_id_seq" owned by "public"."team_members"."id";

alter sequence "public"."teams_id_seq" owned by "public"."teams"."id";

CREATE UNIQUE INDEX action_logs_pkey ON public.action_logs USING btree (id);

CREATE UNIQUE INDEX teams_stripe_customer_id_unique ON public.teams USING btree (stripe_customer_id);

CREATE UNIQUE INDEX teams_stripe_subscription_id_unique ON public.teams USING btree (stripe_subscription_id);

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);

alter table "public"."action_logs" add constraint "action_logs_pkey" PRIMARY KEY using index "action_logs_pkey";

alter table "public"."action_logs" add constraint "action_logs_team_id_teams_id_fk" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE not valid;

alter table "public"."action_logs" validate constraint "action_logs_team_id_teams_id_fk";

alter table "public"."action_logs" add constraint "action_logs_user_id_users_id_fk" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."action_logs" validate constraint "action_logs_user_id_users_id_fk";

alter table "public"."teams" add constraint "teams_stripe_customer_id_unique" UNIQUE using index "teams_stripe_customer_id_unique";

alter table "public"."teams" add constraint "teams_stripe_subscription_id_unique" UNIQUE using index "teams_stripe_subscription_id_unique";

alter table "public"."users" add constraint "users_email_unique" UNIQUE using index "users_email_unique";



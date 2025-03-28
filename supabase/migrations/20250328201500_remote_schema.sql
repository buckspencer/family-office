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

drop policy "Team members can view activity logs" on "public"."activity_logs";

drop policy "Team members can create AI chats" on "public"."family_ai_chats";

drop policy "Team members can delete their own AI chats" on "public"."family_ai_chats";

drop policy "Team members can update their own AI chats" on "public"."family_ai_chats";

drop policy "Team members can view AI chats" on "public"."family_ai_chats";

drop policy "Team members can create family dates" on "public"."family_dates";

drop policy "Team members can delete their own dates" on "public"."family_dates";

drop policy "Team members can update their own dates" on "public"."family_dates";

drop policy "Team members can view family dates" on "public"."family_dates";

drop policy "Team members can create family documents" on "public"."family_documents";

drop policy "Team members can delete their own documents" on "public"."family_documents";

drop policy "Team members can update their own documents" on "public"."family_documents";

drop policy "Team members can view family documents" on "public"."family_documents";

drop policy "Team members can create family events" on "public"."family_events";

drop policy "Team members can delete their own events" on "public"."family_events";

drop policy "Team members can update their own events" on "public"."family_events";

drop policy "Team members can view family events" on "public"."family_events";

drop policy "Team members can create family information" on "public"."family_information";

drop policy "Team members can delete their own information" on "public"."family_information";

drop policy "Team members can update their own information" on "public"."family_information";

drop policy "Team members can view family information" on "public"."family_information";

drop policy "Team members can create family memories" on "public"."family_memories";

drop policy "Team members can delete their own memories" on "public"."family_memories";

drop policy "Team members can update their own memories" on "public"."family_memories";

drop policy "Team members can view family memories" on "public"."family_memories";

drop policy "Team members can create family subscriptions" on "public"."family_subscriptions";

drop policy "Team members can delete their own subscriptions" on "public"."family_subscriptions";

drop policy "Team members can update their own subscriptions" on "public"."family_subscriptions";

drop policy "Team members can view family subscriptions" on "public"."family_subscriptions";

drop policy "Team members can create family tasks" on "public"."family_tasks";

drop policy "Team members can delete their own tasks" on "public"."family_tasks";

drop policy "Team members can update their own tasks" on "public"."family_tasks";

drop policy "Team members can view family tasks" on "public"."family_tasks";

drop policy "Team admins can create invitations" on "public"."invitations";

drop policy "Team admins can delete invitations" on "public"."invitations";

drop policy "Team admins can update invitations" on "public"."invitations";

drop policy "Team members can view invitations" on "public"."invitations";

drop policy "Team admins can manage team members" on "public"."team_members";

drop policy "Team members can view team member data" on "public"."team_members";

drop policy "Team admins can update team data" on "public"."teams";

drop policy "Team members can view team data" on "public"."teams";

drop policy "Users can update their own data" on "public"."users";

drop policy "Users can view their own data" on "public"."users";

revoke delete on table "public"."activity_logs" from "anon";

revoke insert on table "public"."activity_logs" from "anon";

revoke references on table "public"."activity_logs" from "anon";

revoke select on table "public"."activity_logs" from "anon";

revoke trigger on table "public"."activity_logs" from "anon";

revoke truncate on table "public"."activity_logs" from "anon";

revoke update on table "public"."activity_logs" from "anon";

revoke delete on table "public"."activity_logs" from "authenticated";

revoke insert on table "public"."activity_logs" from "authenticated";

revoke references on table "public"."activity_logs" from "authenticated";

revoke select on table "public"."activity_logs" from "authenticated";

revoke trigger on table "public"."activity_logs" from "authenticated";

revoke truncate on table "public"."activity_logs" from "authenticated";

revoke update on table "public"."activity_logs" from "authenticated";

revoke delete on table "public"."activity_logs" from "service_role";

revoke insert on table "public"."activity_logs" from "service_role";

revoke references on table "public"."activity_logs" from "service_role";

revoke select on table "public"."activity_logs" from "service_role";

revoke trigger on table "public"."activity_logs" from "service_role";

revoke truncate on table "public"."activity_logs" from "service_role";

revoke update on table "public"."activity_logs" from "service_role";

revoke delete on table "public"."family_ai_chats" from "anon";

revoke insert on table "public"."family_ai_chats" from "anon";

revoke references on table "public"."family_ai_chats" from "anon";

revoke select on table "public"."family_ai_chats" from "anon";

revoke trigger on table "public"."family_ai_chats" from "anon";

revoke truncate on table "public"."family_ai_chats" from "anon";

revoke update on table "public"."family_ai_chats" from "anon";

revoke delete on table "public"."family_ai_chats" from "authenticated";

revoke insert on table "public"."family_ai_chats" from "authenticated";

revoke references on table "public"."family_ai_chats" from "authenticated";

revoke select on table "public"."family_ai_chats" from "authenticated";

revoke trigger on table "public"."family_ai_chats" from "authenticated";

revoke truncate on table "public"."family_ai_chats" from "authenticated";

revoke update on table "public"."family_ai_chats" from "authenticated";

revoke delete on table "public"."family_ai_chats" from "service_role";

revoke insert on table "public"."family_ai_chats" from "service_role";

revoke references on table "public"."family_ai_chats" from "service_role";

revoke select on table "public"."family_ai_chats" from "service_role";

revoke trigger on table "public"."family_ai_chats" from "service_role";

revoke truncate on table "public"."family_ai_chats" from "service_role";

revoke update on table "public"."family_ai_chats" from "service_role";

revoke delete on table "public"."family_dates" from "anon";

revoke insert on table "public"."family_dates" from "anon";

revoke references on table "public"."family_dates" from "anon";

revoke select on table "public"."family_dates" from "anon";

revoke trigger on table "public"."family_dates" from "anon";

revoke truncate on table "public"."family_dates" from "anon";

revoke update on table "public"."family_dates" from "anon";

revoke delete on table "public"."family_dates" from "authenticated";

revoke insert on table "public"."family_dates" from "authenticated";

revoke references on table "public"."family_dates" from "authenticated";

revoke select on table "public"."family_dates" from "authenticated";

revoke trigger on table "public"."family_dates" from "authenticated";

revoke truncate on table "public"."family_dates" from "authenticated";

revoke update on table "public"."family_dates" from "authenticated";

revoke delete on table "public"."family_dates" from "service_role";

revoke insert on table "public"."family_dates" from "service_role";

revoke references on table "public"."family_dates" from "service_role";

revoke select on table "public"."family_dates" from "service_role";

revoke trigger on table "public"."family_dates" from "service_role";

revoke truncate on table "public"."family_dates" from "service_role";

revoke update on table "public"."family_dates" from "service_role";

revoke delete on table "public"."family_documents" from "anon";

revoke insert on table "public"."family_documents" from "anon";

revoke references on table "public"."family_documents" from "anon";

revoke select on table "public"."family_documents" from "anon";

revoke trigger on table "public"."family_documents" from "anon";

revoke truncate on table "public"."family_documents" from "anon";

revoke update on table "public"."family_documents" from "anon";

revoke delete on table "public"."family_documents" from "authenticated";

revoke insert on table "public"."family_documents" from "authenticated";

revoke references on table "public"."family_documents" from "authenticated";

revoke select on table "public"."family_documents" from "authenticated";

revoke trigger on table "public"."family_documents" from "authenticated";

revoke truncate on table "public"."family_documents" from "authenticated";

revoke update on table "public"."family_documents" from "authenticated";

revoke delete on table "public"."family_documents" from "service_role";

revoke insert on table "public"."family_documents" from "service_role";

revoke references on table "public"."family_documents" from "service_role";

revoke select on table "public"."family_documents" from "service_role";

revoke trigger on table "public"."family_documents" from "service_role";

revoke truncate on table "public"."family_documents" from "service_role";

revoke update on table "public"."family_documents" from "service_role";

revoke delete on table "public"."family_events" from "anon";

revoke insert on table "public"."family_events" from "anon";

revoke references on table "public"."family_events" from "anon";

revoke select on table "public"."family_events" from "anon";

revoke trigger on table "public"."family_events" from "anon";

revoke truncate on table "public"."family_events" from "anon";

revoke update on table "public"."family_events" from "anon";

revoke delete on table "public"."family_events" from "authenticated";

revoke insert on table "public"."family_events" from "authenticated";

revoke references on table "public"."family_events" from "authenticated";

revoke select on table "public"."family_events" from "authenticated";

revoke trigger on table "public"."family_events" from "authenticated";

revoke truncate on table "public"."family_events" from "authenticated";

revoke update on table "public"."family_events" from "authenticated";

revoke delete on table "public"."family_events" from "service_role";

revoke insert on table "public"."family_events" from "service_role";

revoke references on table "public"."family_events" from "service_role";

revoke select on table "public"."family_events" from "service_role";

revoke trigger on table "public"."family_events" from "service_role";

revoke truncate on table "public"."family_events" from "service_role";

revoke update on table "public"."family_events" from "service_role";

revoke delete on table "public"."family_information" from "anon";

revoke insert on table "public"."family_information" from "anon";

revoke references on table "public"."family_information" from "anon";

revoke select on table "public"."family_information" from "anon";

revoke trigger on table "public"."family_information" from "anon";

revoke truncate on table "public"."family_information" from "anon";

revoke update on table "public"."family_information" from "anon";

revoke delete on table "public"."family_information" from "authenticated";

revoke insert on table "public"."family_information" from "authenticated";

revoke references on table "public"."family_information" from "authenticated";

revoke select on table "public"."family_information" from "authenticated";

revoke trigger on table "public"."family_information" from "authenticated";

revoke truncate on table "public"."family_information" from "authenticated";

revoke update on table "public"."family_information" from "authenticated";

revoke delete on table "public"."family_information" from "service_role";

revoke insert on table "public"."family_information" from "service_role";

revoke references on table "public"."family_information" from "service_role";

revoke select on table "public"."family_information" from "service_role";

revoke trigger on table "public"."family_information" from "service_role";

revoke truncate on table "public"."family_information" from "service_role";

revoke update on table "public"."family_information" from "service_role";

revoke delete on table "public"."family_memories" from "anon";

revoke insert on table "public"."family_memories" from "anon";

revoke references on table "public"."family_memories" from "anon";

revoke select on table "public"."family_memories" from "anon";

revoke trigger on table "public"."family_memories" from "anon";

revoke truncate on table "public"."family_memories" from "anon";

revoke update on table "public"."family_memories" from "anon";

revoke delete on table "public"."family_memories" from "authenticated";

revoke insert on table "public"."family_memories" from "authenticated";

revoke references on table "public"."family_memories" from "authenticated";

revoke select on table "public"."family_memories" from "authenticated";

revoke trigger on table "public"."family_memories" from "authenticated";

revoke truncate on table "public"."family_memories" from "authenticated";

revoke update on table "public"."family_memories" from "authenticated";

revoke delete on table "public"."family_memories" from "service_role";

revoke insert on table "public"."family_memories" from "service_role";

revoke references on table "public"."family_memories" from "service_role";

revoke select on table "public"."family_memories" from "service_role";

revoke trigger on table "public"."family_memories" from "service_role";

revoke truncate on table "public"."family_memories" from "service_role";

revoke update on table "public"."family_memories" from "service_role";

revoke delete on table "public"."family_subscriptions" from "anon";

revoke insert on table "public"."family_subscriptions" from "anon";

revoke references on table "public"."family_subscriptions" from "anon";

revoke select on table "public"."family_subscriptions" from "anon";

revoke trigger on table "public"."family_subscriptions" from "anon";

revoke truncate on table "public"."family_subscriptions" from "anon";

revoke update on table "public"."family_subscriptions" from "anon";

revoke delete on table "public"."family_subscriptions" from "authenticated";

revoke insert on table "public"."family_subscriptions" from "authenticated";

revoke references on table "public"."family_subscriptions" from "authenticated";

revoke select on table "public"."family_subscriptions" from "authenticated";

revoke trigger on table "public"."family_subscriptions" from "authenticated";

revoke truncate on table "public"."family_subscriptions" from "authenticated";

revoke update on table "public"."family_subscriptions" from "authenticated";

revoke delete on table "public"."family_subscriptions" from "service_role";

revoke insert on table "public"."family_subscriptions" from "service_role";

revoke references on table "public"."family_subscriptions" from "service_role";

revoke select on table "public"."family_subscriptions" from "service_role";

revoke trigger on table "public"."family_subscriptions" from "service_role";

revoke truncate on table "public"."family_subscriptions" from "service_role";

revoke update on table "public"."family_subscriptions" from "service_role";

revoke delete on table "public"."family_tasks" from "anon";

revoke insert on table "public"."family_tasks" from "anon";

revoke references on table "public"."family_tasks" from "anon";

revoke select on table "public"."family_tasks" from "anon";

revoke trigger on table "public"."family_tasks" from "anon";

revoke truncate on table "public"."family_tasks" from "anon";

revoke update on table "public"."family_tasks" from "anon";

revoke delete on table "public"."family_tasks" from "authenticated";

revoke insert on table "public"."family_tasks" from "authenticated";

revoke references on table "public"."family_tasks" from "authenticated";

revoke select on table "public"."family_tasks" from "authenticated";

revoke trigger on table "public"."family_tasks" from "authenticated";

revoke truncate on table "public"."family_tasks" from "authenticated";

revoke update on table "public"."family_tasks" from "authenticated";

revoke delete on table "public"."family_tasks" from "service_role";

revoke insert on table "public"."family_tasks" from "service_role";

revoke references on table "public"."family_tasks" from "service_role";

revoke select on table "public"."family_tasks" from "service_role";

revoke trigger on table "public"."family_tasks" from "service_role";

revoke truncate on table "public"."family_tasks" from "service_role";

revoke update on table "public"."family_tasks" from "service_role";

revoke delete on table "public"."invitations" from "anon";

revoke insert on table "public"."invitations" from "anon";

revoke references on table "public"."invitations" from "anon";

revoke select on table "public"."invitations" from "anon";

revoke trigger on table "public"."invitations" from "anon";

revoke truncate on table "public"."invitations" from "anon";

revoke update on table "public"."invitations" from "anon";

revoke delete on table "public"."invitations" from "authenticated";

revoke insert on table "public"."invitations" from "authenticated";

revoke references on table "public"."invitations" from "authenticated";

revoke select on table "public"."invitations" from "authenticated";

revoke trigger on table "public"."invitations" from "authenticated";

revoke truncate on table "public"."invitations" from "authenticated";

revoke update on table "public"."invitations" from "authenticated";

revoke delete on table "public"."invitations" from "service_role";

revoke insert on table "public"."invitations" from "service_role";

revoke references on table "public"."invitations" from "service_role";

revoke select on table "public"."invitations" from "service_role";

revoke trigger on table "public"."invitations" from "service_role";

revoke truncate on table "public"."invitations" from "service_role";

revoke update on table "public"."invitations" from "service_role";

revoke delete on table "public"."team_members" from "anon";

revoke insert on table "public"."team_members" from "anon";

revoke references on table "public"."team_members" from "anon";

revoke select on table "public"."team_members" from "anon";

revoke trigger on table "public"."team_members" from "anon";

revoke truncate on table "public"."team_members" from "anon";

revoke update on table "public"."team_members" from "anon";

revoke delete on table "public"."team_members" from "authenticated";

revoke insert on table "public"."team_members" from "authenticated";

revoke references on table "public"."team_members" from "authenticated";

revoke select on table "public"."team_members" from "authenticated";

revoke trigger on table "public"."team_members" from "authenticated";

revoke truncate on table "public"."team_members" from "authenticated";

revoke update on table "public"."team_members" from "authenticated";

revoke delete on table "public"."team_members" from "service_role";

revoke insert on table "public"."team_members" from "service_role";

revoke references on table "public"."team_members" from "service_role";

revoke select on table "public"."team_members" from "service_role";

revoke trigger on table "public"."team_members" from "service_role";

revoke truncate on table "public"."team_members" from "service_role";

revoke update on table "public"."team_members" from "service_role";

revoke delete on table "public"."teams" from "anon";

revoke insert on table "public"."teams" from "anon";

revoke references on table "public"."teams" from "anon";

revoke select on table "public"."teams" from "anon";

revoke trigger on table "public"."teams" from "anon";

revoke truncate on table "public"."teams" from "anon";

revoke update on table "public"."teams" from "anon";

revoke delete on table "public"."teams" from "authenticated";

revoke insert on table "public"."teams" from "authenticated";

revoke references on table "public"."teams" from "authenticated";

revoke select on table "public"."teams" from "authenticated";

revoke trigger on table "public"."teams" from "authenticated";

revoke truncate on table "public"."teams" from "authenticated";

revoke update on table "public"."teams" from "authenticated";

revoke delete on table "public"."teams" from "service_role";

revoke insert on table "public"."teams" from "service_role";

revoke references on table "public"."teams" from "service_role";

revoke select on table "public"."teams" from "service_role";

revoke trigger on table "public"."teams" from "service_role";

revoke truncate on table "public"."teams" from "service_role";

revoke update on table "public"."teams" from "service_role";

revoke delete on table "public"."users" from "anon";

revoke insert on table "public"."users" from "anon";

revoke references on table "public"."users" from "anon";

revoke select on table "public"."users" from "anon";

revoke trigger on table "public"."users" from "anon";

revoke truncate on table "public"."users" from "anon";

revoke update on table "public"."users" from "anon";

revoke delete on table "public"."users" from "authenticated";

revoke insert on table "public"."users" from "authenticated";

revoke references on table "public"."users" from "authenticated";

revoke select on table "public"."users" from "authenticated";

revoke trigger on table "public"."users" from "authenticated";

revoke truncate on table "public"."users" from "authenticated";

revoke update on table "public"."users" from "authenticated";

revoke delete on table "public"."users" from "service_role";

revoke insert on table "public"."users" from "service_role";

revoke references on table "public"."users" from "service_role";

revoke select on table "public"."users" from "service_role";

revoke trigger on table "public"."users" from "service_role";

revoke truncate on table "public"."users" from "service_role";

revoke update on table "public"."users" from "service_role";

alter table "public"."activity_logs" drop constraint "activity_logs_team_id_teams_id_fk";

alter table "public"."activity_logs" drop constraint "activity_logs_user_id_users_id_fk";

alter table "public"."family_ai_chats" drop constraint "family_ai_chats_team_id_teams_id_fk";

alter table "public"."family_ai_chats" drop constraint "family_ai_chats_user_id_users_id_fk";

alter table "public"."family_dates" drop constraint "family_dates_created_by_users_id_fk";

alter table "public"."family_dates" drop constraint "family_dates_team_id_teams_id_fk";

alter table "public"."family_dates" drop constraint "family_dates_updated_by_users_id_fk";

alter table "public"."family_documents" drop constraint "family_documents_created_by_users_id_fk";

alter table "public"."family_documents" drop constraint "family_documents_team_id_teams_id_fk";

alter table "public"."family_documents" drop constraint "family_documents_updated_by_users_id_fk";

alter table "public"."family_events" drop constraint "family_events_created_by_users_id_fk";

alter table "public"."family_events" drop constraint "family_events_team_id_teams_id_fk";

alter table "public"."family_events" drop constraint "family_events_updated_by_users_id_fk";

alter table "public"."family_information" drop constraint "family_information_created_by_users_id_fk";

alter table "public"."family_information" drop constraint "family_information_team_id_teams_id_fk";

alter table "public"."family_information" drop constraint "family_information_updated_by_users_id_fk";

alter table "public"."family_memories" drop constraint "family_memories_created_by_users_id_fk";

alter table "public"."family_memories" drop constraint "family_memories_team_id_teams_id_fk";

alter table "public"."family_memories" drop constraint "family_memories_updated_by_users_id_fk";

alter table "public"."family_subscriptions" drop constraint "family_subscriptions_created_by_users_id_fk";

alter table "public"."family_subscriptions" drop constraint "family_subscriptions_team_id_teams_id_fk";

alter table "public"."family_subscriptions" drop constraint "family_subscriptions_updated_by_users_id_fk";

alter table "public"."family_tasks" drop constraint "family_tasks_assigned_to_users_id_fk";

alter table "public"."family_tasks" drop constraint "family_tasks_created_by_users_id_fk";

alter table "public"."family_tasks" drop constraint "family_tasks_team_id_teams_id_fk";

alter table "public"."family_tasks" drop constraint "family_tasks_updated_by_users_id_fk";

alter table "public"."invitations" drop constraint "invitations_invited_by_users_id_fk";

alter table "public"."invitations" drop constraint "invitations_team_id_teams_id_fk";

alter table "public"."invitations" drop constraint "invitations_token_key";

alter table "public"."team_members" drop constraint "team_members_created_by_users_id_fk";

alter table "public"."team_members" drop constraint "team_members_team_id_teams_id_fk";

alter table "public"."team_members" drop constraint "team_members_team_id_user_id_key";

alter table "public"."team_members" drop constraint "team_members_updated_by_users_id_fk";

alter table "public"."team_members" drop constraint "team_members_user_id_users_id_fk";

alter table "public"."teams" drop constraint "teams_created_by_users_id_fk";

alter table "public"."teams" drop constraint "teams_name_key";

alter table "public"."teams" drop constraint "teams_updated_by_users_id_fk";

alter table "public"."users" drop constraint "users_created_by_users_id_fk";

alter table "public"."users" drop constraint "users_email_key";

alter table "public"."users" drop constraint "users_updated_by_users_id_fk";

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

alter table "public"."activity_logs" drop column "created_at";

alter table "public"."activity_logs" drop column "details";

alter table "public"."activity_logs" drop column "metadata";

alter table "public"."activity_logs" add column "ip_address" character varying(45);

alter table "public"."activity_logs" add column "timestamp" timestamp without time zone not null default now();

alter table "public"."activity_logs" alter column "action" set data type text using "action"::text;

alter table "public"."activity_logs" alter column "id" set default nextval('activity_logs_id_seq'::regclass);

alter table "public"."activity_logs" alter column "id" set data type integer using "id"::integer;

alter table "public"."activity_logs" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."activity_logs" alter column "user_id" drop not null;

alter table "public"."activity_logs" disable row level security;

alter table "public"."family_ai_chats" drop column "created_at";

alter table "public"."family_ai_chats" drop column "deleted_at";

alter table "public"."family_ai_chats" drop column "response";

alter table "public"."family_ai_chats" drop column "updated_at";

alter table "public"."family_ai_chats" add column "action" jsonb;

alter table "public"."family_ai_chats" add column "role" character varying(20) not null;

alter table "public"."family_ai_chats" add column "timestamp" timestamp without time zone not null default now();

alter table "public"."family_ai_chats" alter column "id" set default nextval('family_ai_chats_id_seq'::regclass);

alter table "public"."family_ai_chats" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_ai_chats" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_ai_chats" disable row level security;

alter table "public"."family_dates" drop column "created_at";

alter table "public"."family_dates" drop column "deleted_at";

alter table "public"."family_dates" drop column "updated_at";

alter table "public"."family_dates" drop column "updated_by";

alter table "public"."family_dates" add column "recurring" boolean not null default false;

alter table "public"."family_dates" add column "type" character varying(50) not null;

alter table "public"."family_dates" alter column "id" set default nextval('family_dates_id_seq'::regclass);

alter table "public"."family_dates" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_dates" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_dates" disable row level security;

alter table "public"."family_documents" drop column "created_by";

alter table "public"."family_documents" drop column "deleted_at";

alter table "public"."family_documents" drop column "updated_by";

alter table "public"."family_documents" add column "tags" text[];

alter table "public"."family_documents" add column "type" character varying(50) not null;

alter table "public"."family_documents" alter column "content" set not null;

alter table "public"."family_documents" alter column "id" set default nextval('family_documents_id_seq'::regclass);

alter table "public"."family_documents" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_documents" alter column "status" set default 'active'::character varying;

alter table "public"."family_documents" alter column "status" set data type character varying(20) using "status"::character varying(20);

alter table "public"."family_documents" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_documents" alter column "title" set data type text using "title"::text;

alter table "public"."family_documents" disable row level security;

alter table "public"."family_events" drop column "created_by";

alter table "public"."family_events" drop column "deleted_at";

alter table "public"."family_events" drop column "updated_by";

alter table "public"."family_events" add column "attendees" text[];

alter table "public"."family_events" add column "location" text;

alter table "public"."family_events" alter column "end_date" set not null;

alter table "public"."family_events" alter column "id" set default nextval('family_events_id_seq'::regclass);

alter table "public"."family_events" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_events" alter column "status" set default 'scheduled'::character varying;

alter table "public"."family_events" alter column "status" set data type character varying(20) using "status"::character varying(20);

alter table "public"."family_events" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_events" alter column "title" set data type text using "title"::text;

alter table "public"."family_events" disable row level security;

alter table "public"."family_information" drop column "content";

alter table "public"."family_information" drop column "deleted_at";

alter table "public"."family_information" drop column "title";

alter table "public"."family_information" drop column "updated_by";

alter table "public"."family_information" add column "category" character varying(50) not null;

alter table "public"."family_information" add column "key" character varying(100) not null;

alter table "public"."family_information" add column "value" text not null;

alter table "public"."family_information" alter column "id" set default nextval('family_information_id_seq'::regclass);

alter table "public"."family_information" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_information" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_information" disable row level security;

alter table "public"."family_memories" drop column "date";

alter table "public"."family_memories" drop column "deleted_at";

alter table "public"."family_memories" drop column "description";

alter table "public"."family_memories" drop column "title";

alter table "public"."family_memories" drop column "updated_by";

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

alter table "public"."family_subscriptions" drop column "deleted_at";

alter table "public"."family_subscriptions" drop column "frequency";

alter table "public"."family_subscriptions" drop column "next_billing_date";

alter table "public"."family_subscriptions" drop column "title";

alter table "public"."family_subscriptions" drop column "updated_by";

alter table "public"."family_subscriptions" add column "monthly_cost" numeric(10,2) not null;

alter table "public"."family_subscriptions" add column "name" character varying(255) not null;

alter table "public"."family_subscriptions" add column "url" text;

alter table "public"."family_subscriptions" alter column "id" set default nextval('family_subscriptions_id_seq'::regclass);

alter table "public"."family_subscriptions" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_subscriptions" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_subscriptions" disable row level security;

alter table "public"."family_tasks" drop column "created_by";

alter table "public"."family_tasks" drop column "deleted_at";

alter table "public"."family_tasks" drop column "updated_by";

alter table "public"."family_tasks" add column "category" character varying(50);

alter table "public"."family_tasks" alter column "assigned_to" drop not null;

alter table "public"."family_tasks" alter column "id" set default nextval('family_tasks_id_seq'::regclass);

alter table "public"."family_tasks" alter column "id" set data type integer using "id"::integer;

alter table "public"."family_tasks" alter column "priority" drop default;

alter table "public"."family_tasks" alter column "priority" drop not null;

alter table "public"."family_tasks" alter column "priority" set data type character varying(10) using "priority"::character varying(10);

alter table "public"."family_tasks" alter column "status" set default 'pending'::character varying;

alter table "public"."family_tasks" alter column "status" set data type character varying(20) using "status"::character varying(20);

alter table "public"."family_tasks" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."family_tasks" alter column "title" set data type text using "title"::text;

alter table "public"."family_tasks" disable row level security;

alter table "public"."invitations" drop column "created_at";

alter table "public"."invitations" drop column "deleted_at";

alter table "public"."invitations" drop column "expires_at";

alter table "public"."invitations" drop column "token";

alter table "public"."invitations" drop column "updated_at";

alter table "public"."invitations" add column "invited_at" timestamp without time zone not null default now();

alter table "public"."invitations" add column "status" character varying(20) not null default 'pending'::character varying;

alter table "public"."invitations" alter column "id" set default nextval('invitations_id_seq'::regclass);

alter table "public"."invitations" alter column "id" set data type integer using "id"::integer;

alter table "public"."invitations" alter column "role" drop default;

alter table "public"."invitations" alter column "role" set data type character varying(50) using "role"::character varying(50);

alter table "public"."invitations" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."invitations" disable row level security;

alter table "public"."team_members" drop column "created_at";

alter table "public"."team_members" drop column "created_by";

alter table "public"."team_members" drop column "deleted_at";

alter table "public"."team_members" drop column "updated_at";

alter table "public"."team_members" drop column "updated_by";

alter table "public"."team_members" add column "joined_at" timestamp without time zone not null default now();

alter table "public"."team_members" alter column "id" set default nextval('team_members_id_seq'::regclass);

alter table "public"."team_members" alter column "id" set data type integer using "id"::integer;

alter table "public"."team_members" alter column "role" drop default;

alter table "public"."team_members" alter column "role" set data type character varying(50) using "role"::character varying(50);

alter table "public"."team_members" alter column "team_id" set data type integer using "team_id"::integer;

alter table "public"."team_members" disable row level security;

alter table "public"."teams" drop column "created_by";

alter table "public"."teams" drop column "deleted_at";

alter table "public"."teams" drop column "description";

alter table "public"."teams" drop column "updated_by";

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

alter table "public"."users" drop column "created_by";

alter table "public"."users" drop column "updated_by";

alter table "public"."users" add column "email_verified" boolean not null default false;

alter table "public"."users" add column "password_hash" text not null;

alter table "public"."users" add column "verification_token" text;

alter table "public"."users" add column "verification_token_expiry" timestamp without time zone;

alter table "public"."users" alter column "name" set data type character varying(100) using "name"::character varying(100);

alter table "public"."users" alter column "role" set default 'member'::character varying;

alter table "public"."users" alter column "role" set data type character varying(20) using "role"::character varying(20);

alter table "public"."users" disable row level security;

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

CREATE UNIQUE INDEX teams_stripe_customer_id_unique ON public.teams USING btree (stripe_customer_id);

CREATE UNIQUE INDEX teams_stripe_subscription_id_unique ON public.teams USING btree (stripe_subscription_id);

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);

alter table "public"."teams" add constraint "teams_stripe_customer_id_unique" UNIQUE using index "teams_stripe_customer_id_unique";

alter table "public"."teams" add constraint "teams_stripe_subscription_id_unique" UNIQUE using index "teams_stripe_subscription_id_unique";

alter table "public"."users" add constraint "users_email_unique" UNIQUE using index "users_email_unique";


create schema if not exists "tap";



CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" varchar(100),
    "email" varchar(255) NOT NULL,
    "password_hash" text NOT NULL,
    "role" varchar(20) NOT NULL DEFAULT 'member',
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "deleted_at" timestamp,
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "teams" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" varchar(100) NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "stripe_product_id" text,
    "plan_name" varchar(50),
    "subscription_status" varchar(50),
    CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
    CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);

CREATE TABLE IF NOT EXISTS "team_members" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL,
    "team_id" uuid NOT NULL,
    "role" varchar(50) NOT NULL,
    "joined_at" timestamp NOT NULL DEFAULT now(),
    CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "team_id" uuid NOT NULL,
    "user_id" uuid,
    "action" text NOT NULL,
    "timestamp" timestamp NOT NULL DEFAULT now(),
    "ip_address" text,
    CONSTRAINT "activity_logs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS "invitations" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "team_id" uuid NOT NULL,
    "email" varchar(255) NOT NULL,
    "role" varchar(50) NOT NULL,
    "invited_by" uuid NOT NULL,
    "invited_at" timestamp NOT NULL DEFAULT now(),
    "status" varchar(50) NOT NULL DEFAULT 'pending',
    CONSTRAINT "invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
); 
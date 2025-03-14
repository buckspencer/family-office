-- Add UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all tables in the correct order to handle foreign key constraints
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all existing migrations from drizzle's tracking
DROP TABLE IF EXISTS drizzle.migrations CASCADE;
DROP SCHEMA IF EXISTS drizzle CASCADE; 
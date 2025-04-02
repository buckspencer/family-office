-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create a temporary UUID column in teams table
ALTER TABLE teams ADD COLUMN temp_id UUID DEFAULT uuid_generate_v4();

-- Step 2: Create new UUID columns in referencing tables
ALTER TABLE action_logs ADD COLUMN temp_team_id UUID;
ALTER TABLE team_members ADD COLUMN temp_team_id UUID;
ALTER TABLE family_memories ADD COLUMN temp_team_id UUID;
ALTER TABLE family_subscriptions ADD COLUMN temp_team_id UUID;
ALTER TABLE family_tasks ADD COLUMN temp_team_id UUID;
ALTER TABLE family_dates ADD COLUMN temp_team_id UUID;
ALTER TABLE family_information ADD COLUMN temp_team_id UUID;
ALTER TABLE family_documents ADD COLUMN temp_team_id UUID;
ALTER TABLE family_events ADD COLUMN temp_team_id UUID;
ALTER TABLE activity_logs ADD COLUMN temp_team_id UUID;
ALTER TABLE family_ai_chats ADD COLUMN temp_team_id UUID;
ALTER TABLE invitations ADD COLUMN temp_team_id UUID;

-- Step 3: Update the temporary UUID columns with corresponding values
UPDATE action_logs SET temp_team_id = teams.temp_id FROM teams WHERE action_logs.team_id = teams.id;
UPDATE team_members SET temp_team_id = teams.temp_id FROM teams WHERE team_members.team_id = teams.id;
UPDATE family_memories SET temp_team_id = teams.temp_id FROM teams WHERE family_memories.team_id = teams.id;
UPDATE family_subscriptions SET temp_team_id = teams.temp_id FROM teams WHERE family_subscriptions.team_id = teams.id;
UPDATE family_tasks SET temp_team_id = teams.temp_id FROM teams WHERE family_tasks.team_id = teams.id;
UPDATE family_dates SET temp_team_id = teams.temp_id FROM teams WHERE family_dates.team_id = teams.id;
UPDATE family_information SET temp_team_id = teams.temp_id FROM teams WHERE family_information.team_id = teams.id;
UPDATE family_documents SET temp_team_id = teams.temp_id FROM teams WHERE family_documents.team_id = teams.id;
UPDATE family_events SET temp_team_id = teams.temp_id FROM teams WHERE family_events.team_id = teams.id;
UPDATE activity_logs SET temp_team_id = teams.temp_id FROM teams WHERE activity_logs.team_id = teams.id;
UPDATE family_ai_chats SET temp_team_id = teams.temp_id FROM teams WHERE family_ai_chats.team_id = teams.id;
UPDATE invitations SET temp_team_id = teams.temp_id FROM teams WHERE invitations.team_id = teams.id;

-- Step 4: Drop foreign key constraints
ALTER TABLE action_logs DROP CONSTRAINT IF EXISTS action_logs_team_id_fkey;
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_team_id_fkey;
ALTER TABLE family_memories DROP CONSTRAINT IF EXISTS family_memories_team_id_fkey;
ALTER TABLE family_subscriptions DROP CONSTRAINT IF EXISTS family_subscriptions_team_id_fkey;
ALTER TABLE family_tasks DROP CONSTRAINT IF EXISTS family_tasks_team_id_fkey;
ALTER TABLE family_dates DROP CONSTRAINT IF EXISTS family_dates_team_id_fkey;
ALTER TABLE family_information DROP CONSTRAINT IF EXISTS family_information_team_id_fkey;
ALTER TABLE family_documents DROP CONSTRAINT IF EXISTS family_documents_team_id_fkey;
ALTER TABLE family_events DROP CONSTRAINT IF EXISTS family_events_team_id_fkey;
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_team_id_fkey;
ALTER TABLE family_ai_chats DROP CONSTRAINT IF EXISTS family_ai_chats_team_id_fkey;
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_team_id_fkey;

-- Step 5: Drop old integer columns
ALTER TABLE action_logs DROP COLUMN team_id;
ALTER TABLE team_members DROP COLUMN team_id;
ALTER TABLE family_memories DROP COLUMN team_id;
ALTER TABLE family_subscriptions DROP COLUMN team_id;
ALTER TABLE family_tasks DROP COLUMN team_id;
ALTER TABLE family_dates DROP COLUMN team_id;
ALTER TABLE family_information DROP COLUMN team_id;
ALTER TABLE family_documents DROP COLUMN team_id;
ALTER TABLE family_events DROP COLUMN team_id;
ALTER TABLE activity_logs DROP COLUMN team_id;
ALTER TABLE family_ai_chats DROP COLUMN team_id;
ALTER TABLE invitations DROP COLUMN team_id;

-- Step 6: Rename temporary columns to final names
ALTER TABLE teams DROP CONSTRAINT teams_pkey;
ALTER TABLE teams DROP COLUMN id;
ALTER TABLE teams RENAME COLUMN temp_id TO id;
ALTER TABLE teams ADD PRIMARY KEY (id);

ALTER TABLE action_logs RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE team_members RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_memories RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_subscriptions RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_tasks RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_dates RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_information RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_documents RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_events RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE activity_logs RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE family_ai_chats RENAME COLUMN temp_team_id TO team_id;
ALTER TABLE invitations RENAME COLUMN temp_team_id TO team_id;

-- Step 7: Add NOT NULL constraints
ALTER TABLE action_logs ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE team_members ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_memories ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_subscriptions ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_tasks ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_dates ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_information ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_documents ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_events ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE family_ai_chats ALTER COLUMN team_id SET NOT NULL;
ALTER TABLE invitations ALTER COLUMN team_id SET NOT NULL;

-- Step 8: Add new foreign key constraints
ALTER TABLE action_logs ADD CONSTRAINT action_logs_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_memories ADD CONSTRAINT family_memories_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_subscriptions ADD CONSTRAINT family_subscriptions_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_tasks ADD CONSTRAINT family_tasks_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_dates ADD CONSTRAINT family_dates_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_information ADD CONSTRAINT family_information_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_documents ADD CONSTRAINT family_documents_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_events ADD CONSTRAINT family_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE family_ai_chats ADD CONSTRAINT family_ai_chats_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE invitations ADD CONSTRAINT invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE; 
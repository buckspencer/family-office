-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_ai_chats ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Team members can view their teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage their teams"
  ON teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Team members policies
CREATE POLICY "Team members can view team members"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team members"
  ON team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members AS tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

-- Activity logs policies
CREATE POLICY "Team members can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = activity_logs.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Invitations policies
CREATE POLICY "Team members can view invitations"
  ON invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invitations.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage invitations"
  ON invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family information policies
CREATE POLICY "Team members can view family information"
  ON family_information FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_information.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create family information"
  ON family_information FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_information.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update family information"
  ON family_information FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_information.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete family information"
  ON family_information FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_information.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family dates policies
CREATE POLICY "Team members can view family dates"
  ON family_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_dates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create family dates"
  ON family_dates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_dates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update family dates"
  ON family_dates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_dates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete family dates"
  ON family_dates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_dates.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family documents policies
CREATE POLICY "Team members can view family documents"
  ON family_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_documents.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create family documents"
  ON family_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_documents.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update family documents"
  ON family_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_documents.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete family documents"
  ON family_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_documents.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family tasks policies
CREATE POLICY "Team members can view family tasks"
  ON family_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_tasks.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create family tasks"
  ON family_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_tasks.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update family tasks"
  ON family_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_tasks.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete family tasks"
  ON family_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_tasks.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family memories policies
CREATE POLICY "Team members can view family memories"
  ON family_memories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_memories.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create family memories"
  ON family_memories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_memories.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update family memories"
  ON family_memories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_memories.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete family memories"
  ON family_memories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_memories.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family subscriptions policies
CREATE POLICY "Team members can view family subscriptions"
  ON family_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_subscriptions.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage family subscriptions"
  ON family_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_subscriptions.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Family AI chats policies
CREATE POLICY "Team members can view family AI chats"
  ON family_ai_chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_ai_chats.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create family AI chats"
  ON family_ai_chats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_ai_chats.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update family AI chats"
  ON family_ai_chats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_ai_chats.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can delete family AI chats"
  ON family_ai_chats FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = family_ai_chats.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  ); 
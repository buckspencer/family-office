-- Add action_logs table for tracking AI actions
CREATE TABLE IF NOT EXISTS action_logs (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMP,
  error TEXT,
  metadata JSONB
);

-- Add indexes for better query performance
CREATE INDEX idx_action_logs_team_id ON action_logs(team_id);
CREATE INDEX idx_action_logs_user_id ON action_logs(user_id);
CREATE INDEX idx_action_logs_status ON action_logs(status);
CREATE INDEX idx_action_logs_created_at ON action_logs(created_at);

-- Add RLS policies
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own team's action logs"
  ON action_logs FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can insert action logs for their team"
  ON action_logs FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
  );

CREATE POLICY "Users can update their own team's action logs"
  ON action_logs FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() 
      AND deleted_at IS NULL
    )
  );

-- Add function to log actions
CREATE OR REPLACE FUNCTION log_action(
  p_team_id INTEGER,
  p_user_id UUID,
  p_action_type VARCHAR,
  p_action_data JSONB,
  p_metadata JSONB DEFAULT NULL
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action_id INTEGER;
BEGIN
  INSERT INTO action_logs (
    team_id,
    user_id,
    action_type,
    action_data,
    metadata
  ) VALUES (
    p_team_id,
    p_user_id,
    p_action_type,
    p_action_data,
    p_metadata
  ) RETURNING id INTO v_action_id;

  RETURN v_action_id;
END;
$$; 
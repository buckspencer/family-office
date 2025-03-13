-- Create asset_type enum
CREATE TYPE asset_type AS ENUM ('property', 'vehicle', 'investment', 'insurance', 'other');

-- Create assets table
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type asset_type NOT NULL,
  description TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  purchase_date TIMESTAMP,
  purchase_price DECIMAL(15, 2),
  location TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  tags TEXT[],
  metadata JSONB,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create attachments table for file uploads (can be linked to any resource)
CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  resource_type VARCHAR(50) NOT NULL, -- 'asset', 'contact', 'document', etc.
  resource_id INTEGER NOT NULL,
  is_archived BOOLEAN DEFAULT false,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_assets_team ON assets(team_id);
CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_archived ON assets(is_archived);

CREATE INDEX idx_attachments_team ON attachments(team_id);
CREATE INDEX idx_attachments_user ON attachments(user_id);
CREATE INDEX idx_attachments_resource ON attachments(resource_type, resource_id);
CREATE INDEX idx_attachments_archived ON attachments(is_archived);

-- Create triggers for updated_at
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at
    BEFORE UPDATE ON attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
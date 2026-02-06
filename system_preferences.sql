-- System Preferences Table
CREATE TABLE IF NOT EXISTS system_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_preferences_user_key ON system_preferences(user_id, key);

-- Insert some default preferences (optional, but good for demo)
-- INSERT INTO system_preferences (user_id, key, value) VALUES 
-- ('current_user', 'default_project_stage', '"Idea"'),
-- ('current_user', 'timezone', '"Auto-detect"'),
-- ('current_user', 'ai_autonomy_level', '"Guided"');

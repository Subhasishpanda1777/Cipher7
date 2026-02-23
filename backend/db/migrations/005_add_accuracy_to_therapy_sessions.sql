ALTER TABLE therapy_sessions
  ADD COLUMN IF NOT EXISTS accuracy_percent INTEGER DEFAULT 0;

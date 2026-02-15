-- ============================================
-- 013: Audit Log Enhancement
-- Adds audit_logs table if it does not exist,
-- plus performance indexes.
-- ============================================

-- Create audit_logs table if not already present
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL DEFAULT '',
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable row-level security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only select policy (idempotent: drop first if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin view audit logs' AND tablename = 'audit_logs'
  ) THEN
    DROP POLICY "Admin view audit logs" ON audit_logs;
  END IF;
END
$$;

CREATE POLICY "Admin view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(table_name, record_id);

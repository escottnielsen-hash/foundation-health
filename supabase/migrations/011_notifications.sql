-- ============================================
-- 011: Notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'claim', 'insurance', 'telemedicine', 'billing', 'system', 'message')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- State
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Action link
  action_url TEXT, -- URL to navigate to when clicked
  action_label TEXT, -- e.g., "View Appointment", "Review Claim"

  -- Metadata
  related_entity_type TEXT, -- 'appointment', 'claim', 'session', etc.
  related_entity_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Staff create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('physician', 'staff', 'admin'))
    OR user_id = auth.uid()
  );

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

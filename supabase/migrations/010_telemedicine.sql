-- ============================================
-- Telemedicine Sessions
-- ============================================

CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES profiles(id),
  physician_id UUID NOT NULL REFERENCES profiles(id),

  -- Session details
  session_type TEXT NOT NULL CHECK (session_type IN ('pre_op_consult', 'post_op_followup', 'general_consult', 'second_opinion', 'urgent_care')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting_room', 'in_progress', 'completed', 'cancelled', 'no_show')),

  -- Timing
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_duration_minutes INTEGER NOT NULL DEFAULT 30,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Video
  room_id TEXT, -- video room identifier
  room_url TEXT, -- join URL
  recording_url TEXT,

  -- Clinical
  chief_complaint TEXT,
  clinical_notes TEXT,
  follow_up_instructions TEXT,
  prescriptions_issued TEXT[],

  -- Consent & compliance
  patient_consent_given BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  patient_state TEXT, -- state patient is connecting from (licensing compliance)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE telemedicine_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view own sessions" ON telemedicine_sessions
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Physicians view their sessions" ON telemedicine_sessions
  FOR SELECT USING (physician_id = auth.uid());
CREATE POLICY "Staff manage sessions" ON telemedicine_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('physician', 'staff', 'admin'))
  );

-- ============================================
-- Session messages (chat during session)
-- ============================================

CREATE TABLE IF NOT EXISTS telemedicine_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE telemedicine_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants view messages" ON telemedicine_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM telemedicine_sessions ts
      WHERE ts.id = telemedicine_messages.session_id
      AND (ts.patient_id = auth.uid() OR ts.physician_id = auth.uid())
    )
  );
CREATE POLICY "Staff manage messages" ON telemedicine_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('physician', 'staff', 'admin'))
  );

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_tele_sessions_patient ON telemedicine_sessions(patient_id);
CREATE INDEX idx_tele_sessions_physician ON telemedicine_sessions(physician_id);
CREATE INDEX idx_tele_sessions_status ON telemedicine_sessions(status);
CREATE INDEX idx_tele_messages_session ON telemedicine_messages(session_id);

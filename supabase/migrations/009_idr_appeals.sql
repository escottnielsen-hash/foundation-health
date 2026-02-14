-- ============================================
-- 009: IDR (Independent Dispute Resolution) &
-- Appeals Tracking
-- Foundation Health - No Surprises Act IDR
-- pipeline for OON claim dispute resolution.
-- ============================================

-- ============================================
-- 1. CLAIM APPEALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS claim_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
  appeal_level INTEGER NOT NULL DEFAULT 1, -- 1st level, 2nd level, external
  appeal_type TEXT NOT NULL CHECK (appeal_type IN ('internal_first', 'internal_second', 'external', 'state_review')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'upheld', 'overturned', 'partially_overturned', 'withdrawn')),

  -- Submission details
  submitted_at TIMESTAMPTZ,
  deadline DATE,
  reason TEXT NOT NULL,
  supporting_documents TEXT[], -- file references

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_amount INTEGER, -- if partially overturned, new allowed amount in cents
  resolution_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 2. ENHANCED IDR CASES TABLE
-- Adds appeal-to-IDR pipeline fields to the
-- existing idr_cases table from migration 002
-- ============================================

-- Add new columns for baseball-style arbitration tracking
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS case_reference TEXT;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS provider_offer_amount INTEGER;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS payer_offer_amount INTEGER;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS entity_selected_at TIMESTAMPTZ;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS offers_due_date DATE;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS decision_due_date DATE;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS decision_amount INTEGER;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS decision_rationale TEXT;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS qpa_amount INTEGER;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS provider_billed_amount INTEGER;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS idr_fee_amount INTEGER;
ALTER TABLE idr_cases ADD COLUMN IF NOT EXISTS idr_fee_paid_by TEXT CHECK (idr_fee_paid_by IS NULL OR idr_fee_paid_by IN ('provider', 'payer', 'split'));

-- ============================================
-- 3. ROW LEVEL SECURITY - CLAIM APPEALS
-- ============================================

ALTER TABLE claim_appeals ENABLE ROW LEVEL SECURITY;

-- Patients can view appeals on their own claims
CREATE POLICY "Patients view own appeals" ON claim_appeals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM insurance_claims ic
      JOIN patient_profiles pp ON ic.patient_id = pp.id
      WHERE ic.id = claim_appeals.claim_id
      AND pp.user_id = auth.uid()
    )
  );

-- Staff/physicians/admins can manage all appeals
CREATE POLICY "Staff manage appeals" ON claim_appeals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('physician', 'staff', 'admin'))
  );

-- ============================================
-- 4. INDEXES - CLAIM APPEALS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_claim_appeals_claim_id
  ON claim_appeals(claim_id);

CREATE INDEX IF NOT EXISTS idx_claim_appeals_status
  ON claim_appeals(status);

CREATE INDEX IF NOT EXISTS idx_claim_appeals_appeal_type
  ON claim_appeals(appeal_type);

CREATE INDEX IF NOT EXISTS idx_claim_appeals_deadline
  ON claim_appeals(deadline);

CREATE INDEX IF NOT EXISTS idx_claim_appeals_submitted_at
  ON claim_appeals(submitted_at);

-- ============================================
-- 5. INDEXES - IDR CASES (new columns)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_idr_cases_decided_at
  ON idr_cases(decided_at);

CREATE INDEX IF NOT EXISTS idx_idr_cases_offers_due_date
  ON idr_cases(offers_due_date);

CREATE INDEX IF NOT EXISTS idx_idr_cases_decision_due_date
  ON idr_cases(decision_due_date);

-- ============================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_claim_appeals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_claim_appeals_updated_at
  BEFORE UPDATE ON claim_appeals
  FOR EACH ROW
  EXECUTE FUNCTION update_claim_appeals_updated_at();

-- ============================================
-- 7. AUDIT TRIGGER
-- ============================================

CREATE TRIGGER audit_claim_appeals
  AFTER INSERT OR UPDATE OR DELETE ON claim_appeals
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON claim_appeals TO authenticated;
GRANT SELECT ON claim_appeals TO anon;

-- ============================================
-- END OF MIGRATION 009
-- ============================================

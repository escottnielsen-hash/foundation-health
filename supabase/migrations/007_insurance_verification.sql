-- ============================================
-- 007: Insurance Verification & OON Benefits
-- Foundation Health - Out-of-Network insurance
-- verification for patient benefit estimation.
-- ============================================

-- Insurance verifications table
CREATE TABLE IF NOT EXISTS insurance_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insurance_policy_id UUID REFERENCES insurance_policies(id),

  -- Insurance info
  payer_name TEXT NOT NULL,
  payer_id TEXT,
  member_id TEXT NOT NULL,
  group_number TEXT,
  plan_type TEXT, -- PPO, HMO, EPO, POS, etc.

  -- OON Benefits verification
  oon_deductible_individual INTEGER, -- in cents
  oon_deductible_family INTEGER,
  oon_deductible_met INTEGER, -- amount already met, in cents
  oon_out_of_pocket_max INTEGER,
  oon_out_of_pocket_met INTEGER,
  oon_coinsurance_pct INTEGER, -- e.g., 40 for 40%

  -- In-network for comparison
  inn_deductible_individual INTEGER,
  inn_coinsurance_pct INTEGER,

  -- Verification details
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  reference_number TEXT,
  notes TEXT,

  -- Estimated reimbursement
  estimated_allowed_amount INTEGER, -- what insurer may pay (cents)
  estimated_patient_responsibility INTEGER, -- what patient likely owes after insurance (cents)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE insurance_verifications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own verifications
CREATE POLICY "Patients view own verifications" ON insurance_verifications
  FOR SELECT USING (patient_id = auth.uid());

-- Staff can manage all verifications
CREATE POLICY "Staff manage verifications" ON insurance_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('physician', 'staff', 'admin'))
  );

-- Patients can insert their own verification requests
CREATE POLICY "Patients insert own verifications" ON insurance_verifications
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Patients can update their own pending verifications
CREATE POLICY "Patients update own pending verifications" ON insurance_verifications
  FOR UPDATE USING (
    patient_id = auth.uid() AND verification_status = 'pending'
  );

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_insurance_verifications_patient_id
  ON insurance_verifications(patient_id);

CREATE INDEX IF NOT EXISTS idx_insurance_verifications_status
  ON insurance_verifications(verification_status);

CREATE INDEX IF NOT EXISTS idx_insurance_verifications_patient_status
  ON insurance_verifications(patient_id, verification_status);

-- ============================================
-- Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_insurance_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insurance_verifications_updated_at
  BEFORE UPDATE ON insurance_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_insurance_verifications_updated_at();

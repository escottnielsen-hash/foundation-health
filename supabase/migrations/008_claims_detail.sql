-- Foundation Health Phase 1e: Claims Detail Migration
-- Extends the insurance_claims table with OON billing fields,
-- adds claim line items and activity log tables
-- Version: 008
-- Date: 2026-02-14

-- ============================================
-- 1. ADD COLUMNS TO insurance_claims
-- ============================================

ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS member_id TEXT;
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS place_of_service TEXT;
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS referring_provider TEXT;
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS rendering_provider TEXT;
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS qpa_amount INTEGER; -- Qualifying Payment Amount in cents
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS billed_multiplier NUMERIC(4,2); -- e.g., 3.5 for 3.5x QPA
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS idr_eligible BOOLEAN DEFAULT false;
ALTER TABLE insurance_claims ADD COLUMN IF NOT EXISTS eob_received_at TIMESTAMPTZ;

-- ============================================
-- 2. UPDATE claim_status ENUM
-- Drop old type, create new one with additional statuses
-- ============================================

-- Add new values to the existing claim_status enum
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'in_review';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'idr_initiated';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'idr_resolved';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'closed';

-- ============================================
-- 3. CLAIM LINE ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS claim_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    cpt_code TEXT NOT NULL,
    cpt_description TEXT,
    icd10_codes TEXT[],
    modifier TEXT,
    units INTEGER NOT NULL DEFAULT 1,
    charge_amount INTEGER NOT NULL, -- billed amount in cents
    qpa_amount INTEGER,             -- QPA for this specific code in cents
    allowed_amount INTEGER,          -- allowed amount in cents
    paid_amount INTEGER,             -- paid amount in cents
    denial_reason_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim_line_items_claim_id ON claim_line_items(claim_id);

-- ============================================
-- 4. CLAIM ACTIVITIES TABLE (activity log)
-- ============================================

CREATE TABLE IF NOT EXISTS claim_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'submitted', 'acknowledged', 'info_requested', 'denied',
        'partially_paid', 'paid', 'appeal_filed', 'idr_initiated',
        'idr_resolved', 'note_added', 'eob_received'
    )),
    description TEXT NOT NULL,
    performed_by UUID REFERENCES profiles(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim_activities_claim_id ON claim_activities(claim_id);

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE claim_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_activities ENABLE ROW LEVEL SECURITY;

-- Claim line items: patients can view their own
CREATE POLICY "Patients view own claim lines" ON claim_line_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            WHERE insurance_claims.id = claim_line_items.claim_id
            AND insurance_claims.patient_id IN (
                SELECT id FROM patient_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Claim line items: staff can manage
CREATE POLICY "Staff manage claim lines" ON claim_line_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('physician', 'staff', 'admin')
        )
    );

-- Claim activities: patients can view their own
CREATE POLICY "Patients view own claim activities" ON claim_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM insurance_claims
            WHERE insurance_claims.id = claim_activities.claim_id
            AND insurance_claims.patient_id IN (
                SELECT id FROM patient_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Claim activities: staff can manage
CREATE POLICY "Staff manage claim activities" ON claim_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('physician', 'staff', 'admin')
        )
    );

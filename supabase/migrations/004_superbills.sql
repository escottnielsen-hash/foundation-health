-- Foundation Health Phase 1c Migration
-- Superbills table for out-of-network reimbursement documentation
-- Version: 004
-- Date: 2026-02-14

-- ============================================
-- 1. SUPERBILL STATUS ENUM
-- ============================================

CREATE TYPE superbill_status AS ENUM (
    'generated',
    'submitted_to_insurance',
    'reimbursed',
    'denied',
    'pending_review'
);

-- ============================================
-- 2. SUPERBILLS TABLE
-- ============================================

CREATE TABLE superbills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    provider_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    date_of_service DATE NOT NULL,
    place_of_service_code TEXT NOT NULL DEFAULT '11',
    diagnosis_codes JSONB NOT NULL DEFAULT '[]',
    procedure_codes JSONB NOT NULL DEFAULT '[]',
    total_charges_cents INTEGER NOT NULL DEFAULT 0,
    status superbill_status NOT NULL DEFAULT 'generated',
    insurance_submitted_at TIMESTAMPTZ,
    reimbursement_amount_cents INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX idx_superbills_patient_id ON superbills(patient_id);
CREATE INDEX idx_superbills_encounter_id ON superbills(encounter_id);
CREATE INDEX idx_superbills_provider_id ON superbills(provider_id);
CREATE INDEX idx_superbills_status ON superbills(status);
CREATE INDEX idx_superbills_date_of_service ON superbills(date_of_service);

-- ============================================
-- 4. ENABLE RLS
-- ============================================

ALTER TABLE superbills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Patients can view their own superbills
CREATE POLICY "Patients can view own superbills"
    ON superbills FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Practice staff can manage superbills (insert, update, delete, select)
CREATE POLICY "Practice staff can manage superbills"
    ON superbills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            JOIN physician_profiles pp ON pp.practice_id = ps.practice_id
            WHERE ps.user_id = auth.uid()
            AND pp.id = superbills.provider_id
        )
    );

-- Physicians can manage superbills they are providers on
CREATE POLICY "Physicians can manage own superbills"
    ON superbills FOR ALL
    USING (
        provider_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_superbills_updated_at
    BEFORE UPDATE ON superbills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. AUDIT TRIGGER
-- ============================================

CREATE TRIGGER audit_superbills
    AFTER INSERT OR UPDATE OR DELETE ON superbills
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON superbills TO authenticated;
GRANT SELECT ON superbills TO anon;

-- ============================================
-- END OF MIGRATION 004
-- ============================================

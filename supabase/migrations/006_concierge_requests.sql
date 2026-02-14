-- Foundation Health Phase 1d Migration
-- Concierge requests table for travel & concierge services
-- Version: 005
-- Date: 2026-02-14

-- ============================================
-- 1. CONCIERGE REQUEST STATUS ENUM
-- ============================================

CREATE TYPE concierge_request_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled'
);

-- ============================================
-- 2. CONCIERGE REQUESTS TABLE
-- ============================================

CREATE TABLE concierge_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    request_type TEXT NOT NULL,
    details TEXT NOT NULL,
    preferred_date DATE,
    special_requirements TEXT,
    status concierge_request_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX idx_concierge_requests_patient_id ON concierge_requests(patient_id);
CREATE INDEX idx_concierge_requests_status ON concierge_requests(status);
CREATE INDEX idx_concierge_requests_location ON concierge_requests(location);
CREATE INDEX idx_concierge_requests_request_type ON concierge_requests(request_type);
CREATE INDEX idx_concierge_requests_created_at ON concierge_requests(created_at);

-- ============================================
-- 4. ENABLE RLS
-- ============================================

ALTER TABLE concierge_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Patients can view their own concierge requests
CREATE POLICY "Patients can view own concierge requests"
    ON concierge_requests FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Patients can insert their own concierge requests
CREATE POLICY "Patients can create own concierge requests"
    ON concierge_requests FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Practice staff can manage all concierge requests
CREATE POLICY "Practice staff can manage concierge requests"
    ON concierge_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff
            WHERE practice_staff.user_id = auth.uid()
        )
    );

-- ============================================
-- 6. UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_concierge_requests_updated_at
    BEFORE UPDATE ON concierge_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. AUDIT TRIGGER
-- ============================================

CREATE TRIGGER audit_concierge_requests
    AFTER INSERT OR UPDATE OR DELETE ON concierge_requests
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON concierge_requests TO authenticated;
GRANT SELECT ON concierge_requests TO anon;

-- ============================================
-- END OF MIGRATION 005
-- ============================================

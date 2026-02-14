-- Foundation Health Phase 1 Migration
-- Adds first_name/last_name to profiles, creates location/membership/billing/insurance tables
-- Version: 002
-- Date: 2026-02-13

-- ============================================
-- 1. FIX PROFILES: Add first_name / last_name
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Back-fill from existing full_name data
UPDATE profiles
SET first_name = split_part(full_name, ' ', 1),
    last_name  = CASE
                   WHEN position(' ' IN full_name) > 0
                   THEN substring(full_name FROM position(' ' IN full_name) + 1)
                   ELSE NULL
                 END
WHERE full_name IS NOT NULL
  AND first_name IS NULL;

-- Keep full_name in sync going forward via a generated column is not possible
-- on existing columns in Postgres, so we use a trigger instead.
CREATE OR REPLACE FUNCTION sync_full_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.full_name := TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
    IF NEW.full_name = '' THEN
        NEW.full_name := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_profiles_full_name
    BEFORE INSERT OR UPDATE OF first_name, last_name ON profiles
    FOR EACH ROW EXECUTE FUNCTION sync_full_name();

-- Update the handle_new_user function to populate first_name / last_name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            TRIM(
                COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' ||
                COALESCE(NEW.raw_user_meta_data->>'last_name', '')
            )
        ),
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), ' ', 1)),
        COALESCE(
            NEW.raw_user_meta_data->>'last_name',
            CASE
                WHEN position(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')) > 0
                THEN substring(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name') FROM position(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')) + 1)
                ELSE NULL
            END
        ),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);

-- ============================================
-- 2. NEW ENUM TYPES
-- ============================================

CREATE TYPE location_type AS ENUM ('hub', 'spoke', 'mobile', 'virtual');
CREATE TYPE membership_tier_name AS ENUM ('platinum', 'gold', 'silver');
CREATE TYPE membership_status AS ENUM ('active', 'past_due', 'cancelled', 'paused');
CREATE TYPE encounter_status AS ENUM ('checked_in', 'in_progress', 'completed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void', 'refunded');
CREATE TYPE claim_status AS ENUM ('draft', 'submitted', 'acknowledged', 'pending', 'denied', 'partially_paid', 'paid', 'appealed');
CREATE TYPE idr_status AS ENUM ('initiated', 'negotiation', 'submitted', 'hearing_scheduled', 'decided', 'closed');

-- ============================================
-- 3. LOCATIONS TABLE (hub-spoke model)
-- ============================================

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_type location_type NOT NULL DEFAULT 'spoke',
    parent_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    is_critical_access BOOLEAN DEFAULT FALSE,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    county TEXT,
    country TEXT DEFAULT 'US',
    phone TEXT,
    fax TEXT,
    email TEXT,
    operating_hours JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'America/New_York',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    npi TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_practice_id ON locations(practice_id);
CREATE INDEX idx_locations_location_type ON locations(location_type);
CREATE INDEX idx_locations_parent_location_id ON locations(parent_location_id);
CREATE INDEX idx_locations_is_active ON locations(is_active);
CREATE INDEX idx_locations_state ON locations(state);

-- ============================================
-- 4. ADD location_id TO APPOINTMENTS
-- ============================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_location_id ON appointments(location_id);

-- ============================================
-- 5. MEMBERSHIP TIERS TABLE
-- ============================================

CREATE TABLE membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    name membership_tier_name NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10, 2) NOT NULL,
    annual_price DECIMAL(10, 2),
    stripe_monthly_price_id TEXT,
    stripe_annual_price_id TEXT,
    features JSONB DEFAULT '[]',
    visit_discount_percent DECIMAL(5, 2) DEFAULT 0,
    lab_discount_percent DECIMAL(5, 2) DEFAULT 0,
    imaging_discount_percent DECIMAL(5, 2) DEFAULT 0,
    telehealth_included BOOLEAN DEFAULT FALSE,
    max_telehealth_visits INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(practice_id, name)
);

CREATE INDEX idx_membership_tiers_practice_id ON membership_tiers(practice_id);
CREATE INDEX idx_membership_tiers_is_active ON membership_tiers(is_active);

-- ============================================
-- 6. PATIENT MEMBERSHIPS TABLE
-- ============================================

CREATE TABLE patient_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES membership_tiers(id) ON DELETE RESTRICT,
    status membership_status NOT NULL DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'annual')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patient_memberships_patient_id ON patient_memberships(patient_id);
CREATE INDEX idx_patient_memberships_tier_id ON patient_memberships(tier_id);
CREATE INDEX idx_patient_memberships_status ON patient_memberships(status);
CREATE INDEX idx_patient_memberships_stripe_subscription_id ON patient_memberships(stripe_subscription_id);

-- ============================================
-- 7. SERVICE CATALOG TABLE
-- ============================================

CREATE TABLE service_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'primary_care', 'lab', 'imaging', 'procedure', 'telehealth', etc.
    cpt_code TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    platinum_price DECIMAL(10, 2),
    gold_price DECIMAL(10, 2),
    silver_price DECIMAL(10, 2),
    duration_minutes INTEGER,
    is_telehealth_eligible BOOLEAN DEFAULT FALSE,
    requires_referral BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_catalog_practice_id ON service_catalog(practice_id);
CREATE INDEX idx_service_catalog_category ON service_catalog(category);
CREATE INDEX idx_service_catalog_cpt_code ON service_catalog(cpt_code);
CREATE INDEX idx_service_catalog_is_active ON service_catalog(is_active);

-- ============================================
-- 8. ENCOUNTERS TABLE
-- ============================================

CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    status encounter_status NOT NULL DEFAULT 'checked_in',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    chief_complaint TEXT,
    diagnosis_codes TEXT[],
    procedure_codes TEXT[],
    visit_notes TEXT,
    plan TEXT,
    follow_up_instructions TEXT,
    follow_up_date DATE,
    vitals JSONB DEFAULT '{}',
    is_telehealth BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_encounters_appointment_id ON encounters(appointment_id);
CREATE INDEX idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX idx_encounters_physician_id ON encounters(physician_id);
CREATE INDEX idx_encounters_location_id ON encounters(location_id);
CREATE INDEX idx_encounters_status ON encounters(status);
CREATE INDEX idx_encounters_check_in_time ON encounters(check_in_time);

-- ============================================
-- 9. INVOICES TABLE (cash-pay billing)
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    status invoice_status NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
    membership_tier_applied membership_tier_name,
    line_items JSONB DEFAULT '[]', -- [{service_id, name, cpt_code, qty, unit_price, discount, total}]
    notes TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_encounter_id ON invoices(encounter_id);
CREATE INDEX idx_invoices_practice_id ON invoices(practice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                              LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_num
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- 10. INSURANCE PAYERS TABLE
-- ============================================

CREATE TABLE insurance_payers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    payer_id TEXT UNIQUE, -- standard payer ID for electronic claims
    phone TEXT,
    fax TEXT,
    email TEXT,
    website TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    claims_address_line1 TEXT,
    claims_address_line2 TEXT,
    claims_city TEXT,
    claims_state TEXT,
    claims_zip_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_payers_payer_id ON insurance_payers(payer_id);
CREATE INDEX idx_insurance_payers_is_active ON insurance_payers(is_active);
CREATE INDEX idx_insurance_payers_name ON insurance_payers(name);

-- ============================================
-- 11. INSURANCE CLAIMS TABLE (OON claim tracking)
-- ============================================

CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number TEXT UNIQUE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE RESTRICT,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    policy_number TEXT,
    group_number TEXT,
    subscriber_name TEXT,
    subscriber_dob DATE,
    subscriber_relationship TEXT DEFAULT 'self', -- 'self', 'spouse', 'child', 'other'
    status claim_status NOT NULL DEFAULT 'draft',
    claim_type TEXT DEFAULT 'out_of_network', -- 'in_network', 'out_of_network'
    service_date DATE NOT NULL,
    diagnosis_codes TEXT[],
    procedure_codes TEXT[],
    billed_amount DECIMAL(10, 2) NOT NULL,
    allowed_amount DECIMAL(10, 2),
    paid_amount DECIMAL(10, 2),
    patient_responsibility DECIMAL(10, 2),
    adjustment_amount DECIMAL(10, 2),
    denial_reason TEXT,
    appeal_deadline DATE,
    submitted_at TIMESTAMPTZ,
    response_received_at TIMESTAMPTZ,
    eob_url TEXT,
    notes TEXT,
    status_history JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insurance_claims_patient_id ON insurance_claims(patient_id);
CREATE INDEX idx_insurance_claims_encounter_id ON insurance_claims(encounter_id);
CREATE INDEX idx_insurance_claims_payer_id ON insurance_claims(payer_id);
CREATE INDEX idx_insurance_claims_practice_id ON insurance_claims(practice_id);
CREATE INDEX idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX idx_insurance_claims_claim_number ON insurance_claims(claim_number);
CREATE INDEX idx_insurance_claims_service_date ON insurance_claims(service_date);

-- Auto-generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.claim_number IS NULL THEN
        NEW.claim_number := 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                            LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_claim_num
    BEFORE INSERT ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION generate_claim_number();

-- ============================================
-- 12. IDR CASES TABLE (Independent Dispute Resolution)
-- ============================================

CREATE TABLE idr_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE,
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    payer_id UUID NOT NULL REFERENCES insurance_payers(id) ON DELETE RESTRICT,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    status idr_status NOT NULL DEFAULT 'initiated',
    disputed_amount DECIMAL(10, 2) NOT NULL,
    provider_proposed_amount DECIMAL(10, 2),
    payer_proposed_amount DECIMAL(10, 2),
    final_determined_amount DECIMAL(10, 2),
    qualifying_payment_amount DECIMAL(10, 2), -- QPA
    open_negotiation_start DATE,
    open_negotiation_end DATE,
    idr_entity TEXT, -- name of the IDR entity
    idr_submission_date DATE,
    idr_decision_date DATE,
    prevailing_party TEXT, -- 'provider', 'payer'
    supporting_documents JSONB DEFAULT '[]',
    timeline JSONB DEFAULT '[]', -- [{date, event, notes}]
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_idr_cases_claim_id ON idr_cases(claim_id);
CREATE INDEX idx_idr_cases_patient_id ON idr_cases(patient_id);
CREATE INDEX idx_idr_cases_payer_id ON idr_cases(payer_id);
CREATE INDEX idx_idr_cases_practice_id ON idr_cases(practice_id);
CREATE INDEX idx_idr_cases_status ON idr_cases(status);
CREATE INDEX idx_idr_cases_case_number ON idr_cases(case_number);

-- Auto-generate IDR case number
CREATE OR REPLACE FUNCTION generate_idr_case_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_number IS NULL THEN
        NEW.case_number := 'IDR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                           LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_idr_case_num
    BEFORE INSERT ON idr_cases
    FOR EACH ROW EXECUTE FUNCTION generate_idr_case_number();

-- ============================================
-- 13. ENABLE RLS ON ALL NEW TABLES
-- ============================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE idr_cases ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 14. RLS POLICIES FOR NEW TABLES
-- ============================================

-- LOCATIONS: Anyone can view active locations (public directory)
CREATE POLICY "Anyone can view active locations"
    ON locations FOR SELECT
    USING (is_active = true);

-- Practice admins can manage locations
CREATE POLICY "Practice admins can manage locations"
    ON locations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = locations.practice_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- MEMBERSHIP TIERS: Anyone can view active tiers
CREATE POLICY "Anyone can view active membership tiers"
    ON membership_tiers FOR SELECT
    USING (is_active = true);

-- Practice admins can manage tiers
CREATE POLICY "Practice admins can manage membership tiers"
    ON membership_tiers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = membership_tiers.practice_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- PATIENT MEMBERSHIPS: Patients can view their own
CREATE POLICY "Patients can view own memberships"
    ON patient_memberships FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Practice staff can view memberships for their practice
CREATE POLICY "Practice staff can view memberships"
    ON patient_memberships FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            JOIN membership_tiers mt ON mt.practice_id = ps.practice_id
            WHERE ps.user_id = auth.uid()
            AND mt.id = patient_memberships.tier_id
        )
    );

-- SERVICE CATALOG: Anyone can view active services
CREATE POLICY "Anyone can view active services"
    ON service_catalog FOR SELECT
    USING (is_active = true);

-- Practice admins can manage services
CREATE POLICY "Practice admins can manage services"
    ON service_catalog FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = service_catalog.practice_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- ENCOUNTERS: Patients can view their own encounters
CREATE POLICY "Patients can view own encounters"
    ON encounters FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can view and manage encounters
CREATE POLICY "Physicians can manage encounters"
    ON encounters FOR ALL
    USING (
        physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- INVOICES: Patients can view their own invoices
CREATE POLICY "Patients can view own invoices"
    ON invoices FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Practice staff can manage invoices for their practice
CREATE POLICY "Practice staff can manage invoices"
    ON invoices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = invoices.practice_id
            AND ps.user_id = auth.uid()
        )
    );

-- INSURANCE PAYERS: Anyone can view active payers
CREATE POLICY "Anyone can view active insurance payers"
    ON insurance_payers FOR SELECT
    USING (is_active = true);

-- Admins can manage payers
CREATE POLICY "Admins can manage insurance payers"
    ON insurance_payers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- INSURANCE CLAIMS: Patients can view their own claims
CREATE POLICY "Patients can view own claims"
    ON insurance_claims FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Practice staff can manage claims for their practice
CREATE POLICY "Practice staff can manage claims"
    ON insurance_claims FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = insurance_claims.practice_id
            AND ps.user_id = auth.uid()
        )
    );

-- IDR CASES: Patients can view their own IDR cases
CREATE POLICY "Patients can view own IDR cases"
    ON idr_cases FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Practice staff can manage IDR cases for their practice
CREATE POLICY "Practice staff can manage IDR cases"
    ON idr_cases FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = idr_cases.practice_id
            AND ps.user_id = auth.uid()
        )
    );

-- ============================================
-- 15. UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_tiers_updated_at
    BEFORE UPDATE ON membership_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_memberships_updated_at
    BEFORE UPDATE ON patient_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_catalog_updated_at
    BEFORE UPDATE ON service_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_encounters_updated_at
    BEFORE UPDATE ON encounters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_payers_updated_at
    BEFORE UPDATE ON insurance_payers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_claims_updated_at
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_idr_cases_updated_at
    BEFORE UPDATE ON idr_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 16. AUDIT TRIGGERS FOR SENSITIVE NEW TABLES
-- ============================================

CREATE TRIGGER audit_encounters
    AFTER INSERT OR UPDATE OR DELETE ON encounters
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_invoices
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_insurance_claims
    AFTER INSERT OR UPDATE OR DELETE ON insurance_claims
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_idr_cases
    AFTER INSERT OR UPDATE OR DELETE ON idr_cases
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_patient_memberships
    AFTER INSERT OR UPDATE OR DELETE ON patient_memberships
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- 17. GRANT PERMISSIONS FOR NEW TABLES
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- END OF MIGRATION 002
-- ============================================

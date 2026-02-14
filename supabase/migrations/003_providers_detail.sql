-- Foundation Health Phase 1b Migration — Provider Directory
-- Adds provider_locations junction, provider_services junction,
-- credentials and years_of_experience to physician_profiles.
-- Version: 003
-- Date: 2026-02-13

-- ============================================
-- 1. ADD FIELDS TO physician_profiles
-- ============================================

ALTER TABLE physician_profiles ADD COLUMN IF NOT EXISTS credentials TEXT; -- e.g. 'MD', 'DO', 'MD, FAAOS'
ALTER TABLE physician_profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE physician_profiles ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'; -- [{degree, institution, year}]
ALTER TABLE physician_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE physician_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_physician_profiles_specialty ON physician_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_physician_profiles_is_active ON physician_profiles(is_active);

-- ============================================
-- 2. PROVIDER_LOCATIONS JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS provider_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    days_available TEXT[], -- e.g. {'Monday', 'Wednesday', 'Friday'}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(physician_id, location_id)
);

CREATE INDEX idx_provider_locations_physician ON provider_locations(physician_id);
CREATE INDEX idx_provider_locations_location ON provider_locations(location_id);

-- ============================================
-- 3. PROVIDER_SERVICES JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    custom_price DECIMAL(10, 2), -- override base_price if set
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(physician_id, service_id)
);

CREATE INDEX idx_provider_services_physician ON provider_services(physician_id);
CREATE INDEX idx_provider_services_service ON provider_services(service_id);

-- ============================================
-- 4. ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE provider_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

-- Public read access for the provider directory
CREATE POLICY "Anyone can view provider locations"
    ON provider_locations FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view provider services"
    ON provider_services FOR SELECT
    USING (true);

-- Practice admins can manage provider_locations
CREATE POLICY "Practice admins can manage provider locations"
    ON provider_locations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM physician_profiles pp
            JOIN practice_staff ps ON ps.practice_id = pp.practice_id
            WHERE pp.id = provider_locations.physician_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- Practice admins can manage provider_services
CREATE POLICY "Practice admins can manage provider services"
    ON provider_services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM physician_profiles pp
            JOIN practice_staff ps ON ps.practice_id = pp.practice_id
            WHERE pp.id = provider_services.physician_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- ============================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================

CREATE TRIGGER update_provider_locations_updated_at
    BEFORE UPDATE ON provider_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_services_updated_at
    BEFORE UPDATE ON provider_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON provider_locations TO authenticated;
GRANT ALL ON provider_services TO authenticated;
GRANT SELECT ON provider_locations TO anon;
GRANT SELECT ON provider_services TO anon;

-- ============================================
-- END OF MIGRATION 003
-- ============================================

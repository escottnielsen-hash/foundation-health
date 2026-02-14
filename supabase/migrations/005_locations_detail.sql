-- Foundation Health Phase 1d Migration — Location Directory
-- Adds slug, description, amenities, hero, travel/accommodation info to locations.
-- Also creates location_services junction table.
-- Version: 005
-- Date: 2026-02-14

-- ============================================
-- 1. ADD FIELDS TO locations TABLE
-- ============================================

ALTER TABLE locations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS travel_info TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS accommodation_info TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS concierge_info TEXT;

CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);

-- ============================================
-- 2. LOCATION_SERVICES JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS location_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, service_id)
);

CREATE INDEX idx_location_services_location ON location_services(location_id);
CREATE INDEX idx_location_services_service ON location_services(service_id);

-- ============================================
-- 3. ENABLE RLS ON NEW TABLE
-- ============================================

ALTER TABLE location_services ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view location services"
    ON location_services FOR SELECT
    USING (true);

-- Practice admins can manage
CREATE POLICY "Practice admins can manage location services"
    ON location_services FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM locations l
            JOIN practice_staff ps ON ps.practice_id = l.practice_id
            WHERE l.id = location_services.location_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_location_services_updated_at
    BEFORE UPDATE ON location_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

GRANT ALL ON location_services TO authenticated;
GRANT SELECT ON location_services TO anon;

-- ============================================
-- 6. SEED LOCATION SLUGS FOR EXISTING LOCATIONS
-- (Generates slug from name if not already set)
-- ============================================

UPDATE locations
SET slug = LOWER(REPLACE(REPLACE(REPLACE(TRIM(name), ' ', '-'), '.', ''), ',', ''))
WHERE slug IS NULL;

-- ============================================
-- END OF MIGRATION 005
-- ============================================

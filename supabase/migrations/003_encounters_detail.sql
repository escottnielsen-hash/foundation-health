-- Foundation Health Phase 1b Migration
-- Adds encounter_type, SOAP note fields (subjective, objective, assessment) to encounters
-- Version: 003
-- Date: 2026-02-13

-- ============================================
-- 1. ADD encounter_type TO ENCOUNTERS
-- ============================================

ALTER TABLE encounters ADD COLUMN IF NOT EXISTS encounter_type TEXT DEFAULT 'office_visit'
  CHECK (encounter_type IN ('office_visit', 'telehealth', 'surgical', 'follow_up', 'consultation', 'emergency'));

-- ============================================
-- 2. ADD SOAP NOTE FIELDS TO ENCOUNTERS
-- ============================================
-- chief_complaint already exists (serves as the reason for visit)
-- plan already exists (SOAP P)
-- We add: subjective (S), objective (O), assessment (A)

ALTER TABLE encounters ADD COLUMN IF NOT EXISTS subjective TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE encounters ADD COLUMN IF NOT EXISTS assessment TEXT;

-- ============================================
-- 3. INDEX ON encounter_type
-- ============================================

CREATE INDEX IF NOT EXISTS idx_encounters_encounter_type ON encounters(encounter_type);

-- ============================================
-- END OF MIGRATION 003
-- ============================================

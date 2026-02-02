-- Foundation Health Initial Schema Migration
-- HIPAA-compliant database schema with Row Level Security
-- Version: 001
-- Date: 2026-01-25

-- ============================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ============================================
-- 2. CUSTOM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('patient', 'physician', 'admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing', 'paused');
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE referral_status AS ENUM ('pending', 'accepted', 'completed', 'declined', 'expired');
CREATE TYPE dme_order_status AS ENUM ('pending', 'approved', 'shipped', 'delivered', 'cancelled', 'returned');
CREATE TYPE cme_status AS ENUM ('not_started', 'in_progress', 'completed', 'expired');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'share');

-- ============================================
-- 3. CORE TABLES
-- ============================================

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    date_of_birth DATE,
    gender TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    timezone TEXT DEFAULT 'America/New_York',
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Practices
CREATE TABLE practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    npi TEXT UNIQUE,
    tax_id TEXT,
    phone TEXT,
    fax TEXT,
    email TEXT,
    website TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practices_npi ON practices(npi);

-- Physician Profiles
CREATE TABLE physician_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    npi TEXT UNIQUE,
    license_number TEXT,
    license_state TEXT,
    specialty TEXT,
    subspecialties TEXT[],
    board_certifications TEXT[],
    medical_school TEXT,
    graduation_year INTEGER,
    residency TEXT,
    fellowship TEXT,
    accepting_new_patients BOOLEAN DEFAULT TRUE,
    consultation_fee DECIMAL(10, 2),
    bio TEXT,
    languages TEXT[] DEFAULT ARRAY['English'],
    cme_credits_earned DECIMAL(10, 2) DEFAULT 0,
    cme_credits_required DECIMAL(10, 2) DEFAULT 50,
    cme_cycle_end_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_physician_profiles_user_id ON physician_profiles(user_id);
CREATE INDEX idx_physician_profiles_practice_id ON physician_profiles(practice_id);
CREATE INDEX idx_physician_profiles_npi ON physician_profiles(npi);
CREATE INDEX idx_physician_profiles_specialty ON physician_profiles(specialty);

-- Patient Profiles
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    primary_physician_id UUID REFERENCES physician_profiles(id) ON DELETE SET NULL,
    mrn TEXT UNIQUE, -- Medical Record Number
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    insurance_group_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    allergies TEXT[],
    medications TEXT[],
    medical_conditions TEXT[],
    blood_type TEXT,
    height_inches DECIMAL(5, 2),
    weight_lbs DECIMAL(6, 2),
    bmi DECIMAL(4, 2),
    health_goals TEXT[],
    dietary_restrictions TEXT[],
    activity_level TEXT,
    smoking_status TEXT,
    alcohol_consumption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX idx_patient_profiles_primary_physician ON patient_profiles(primary_physician_id);
CREATE INDEX idx_patient_profiles_mrn ON patient_profiles(mrn);

-- Practice Staff
CREATE TABLE practice_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'admin', 'nurse', 'receptionist', 'billing', etc.
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    hired_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(practice_id, user_id)
);

CREATE INDEX idx_practice_staff_practice_id ON practice_staff(practice_id);
CREATE INDEX idx_practice_staff_user_id ON practice_staff(user_id);

-- ============================================
-- 4. HEALTH RECORDS TABLES
-- ============================================

-- Health Records
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    physician_id UUID REFERENCES physician_profiles(id) ON DELETE SET NULL,
    record_type TEXT NOT NULL, -- 'visit_note', 'prescription', 'diagnosis', 'procedure', 'imaging', etc.
    title TEXT NOT NULL,
    description TEXT,
    record_date DATE NOT NULL,
    icd10_codes TEXT[],
    cpt_codes TEXT[],
    notes TEXT,
    attachments JSONB DEFAULT '[]', -- Array of file URLs with metadata
    is_confidential BOOLEAN DEFAULT FALSE,
    shared_with UUID[] DEFAULT '{}', -- Array of user IDs who have access
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_records_patient_id ON health_records(patient_id);
CREATE INDEX idx_health_records_physician_id ON health_records(physician_id);
CREATE INDEX idx_health_records_record_type ON health_records(record_type);
CREATE INDEX idx_health_records_record_date ON health_records(record_date);

-- Lab Results
CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    ordered_by UUID REFERENCES physician_profiles(id) ON DELETE SET NULL,
    health_record_id UUID REFERENCES health_records(id) ON DELETE SET NULL,
    lab_name TEXT,
    test_name TEXT NOT NULL,
    test_code TEXT,
    specimen_type TEXT,
    collection_date TIMESTAMPTZ NOT NULL,
    result_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    results JSONB NOT NULL DEFAULT '[]', -- Array of {name, value, unit, reference_range, flag}
    interpretation TEXT,
    is_abnormal BOOLEAN DEFAULT FALSE,
    pdf_url TEXT,
    reviewed_by UUID REFERENCES physician_profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX idx_lab_results_ordered_by ON lab_results(ordered_by);
CREATE INDEX idx_lab_results_collection_date ON lab_results(collection_date);
CREATE INDEX idx_lab_results_status ON lab_results(status);

-- Wearable Data
CREATE TABLE wearable_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    device_type TEXT NOT NULL, -- 'apple_watch', 'fitbit', 'garmin', 'oura', 'whoop', etc.
    device_id TEXT,
    metric_type TEXT NOT NULL, -- 'heart_rate', 'steps', 'sleep', 'hrv', 'spo2', 'calories', etc.
    value DECIMAL(12, 4) NOT NULL,
    unit TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wearable_data_patient_id ON wearable_data(patient_id);
CREATE INDEX idx_wearable_data_device_type ON wearable_data(device_type);
CREATE INDEX idx_wearable_data_metric_type ON wearable_data(metric_type);
CREATE INDEX idx_wearable_data_recorded_at ON wearable_data(recorded_at);

-- Partition by month for performance (optional, requires Supabase Pro)
-- CREATE INDEX idx_wearable_data_recorded_at_brin ON wearable_data USING BRIN (recorded_at);

-- ============================================
-- 5. CME/EDUCATION TABLES
-- ============================================

-- CME Courses
CREATE TABLE cme_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    provider TEXT NOT NULL,
    accreditation_body TEXT, -- 'ACCME', 'AAFP', 'AMA', etc.
    credit_hours DECIMAL(4, 2) NOT NULL,
    credit_type TEXT NOT NULL, -- 'AMA PRA Category 1', 'AAFP Prescribed', etc.
    specialty_tags TEXT[],
    difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
    duration_minutes INTEGER,
    content_url TEXT,
    thumbnail_url TEXT,
    syllabus JSONB DEFAULT '[]', -- Array of modules/sections
    learning_objectives TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2),
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cme_courses_specialty_tags ON cme_courses USING GIN (specialty_tags);
CREATE INDEX idx_cme_courses_credit_type ON cme_courses(credit_type);
CREATE INDEX idx_cme_courses_is_active ON cme_courses(is_active);

-- CME Progress
CREATE TABLE cme_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES cme_courses(id) ON DELETE CASCADE,
    status cme_status DEFAULT 'not_started',
    progress_percent DECIMAL(5, 2) DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    certificate_url TEXT,
    quiz_scores JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(physician_id, course_id)
);

CREATE INDEX idx_cme_progress_physician_id ON cme_progress(physician_id);
CREATE INDEX idx_cme_progress_course_id ON cme_progress(course_id);
CREATE INDEX idx_cme_progress_status ON cme_progress(status);

-- Protocols
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'treatment', 'diagnostic', 'preventive', 'emergency'
    specialty TEXT,
    version TEXT DEFAULT '1.0',
    content TEXT NOT NULL, -- Markdown content
    attachments JSONB DEFAULT '[]',
    "references" TEXT[],
    icd10_codes TEXT[],
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE,
    parent_protocol_id UUID REFERENCES protocols(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_protocols_category ON protocols(category);
CREATE INDEX idx_protocols_specialty ON protocols(specialty);
CREATE INDEX idx_protocols_is_published ON protocols(is_published);

-- ============================================
-- 6. APPOINTMENTS TABLE
-- ============================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    appointment_type TEXT NOT NULL, -- 'initial_consultation', 'follow_up', 'annual_physical', 'telehealth', etc.
    title TEXT,
    description TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status appointment_status DEFAULT 'scheduled',
    is_telehealth BOOLEAN DEFAULT FALSE,
    telehealth_url TEXT,
    location TEXT,
    room TEXT,
    reason_for_visit TEXT,
    symptoms TEXT[],
    notes TEXT,
    pre_visit_instructions TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES profiles(id),
    cancellation_reason TEXT,
    no_show_fee DECIMAL(10, 2),
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_physician_id ON appointments(physician_id);
CREATE INDEX idx_appointments_practice_id ON appointments(practice_id);
CREATE INDEX idx_appointments_scheduled_start ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- 7. WELLNESS TABLES
-- ============================================

-- Nutrition Plans
CREATE TABLE nutrition_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT, -- 'weight_loss', 'muscle_gain', 'maintenance', 'medical', etc.
    daily_calories INTEGER,
    macros JSONB DEFAULT '{}', -- {protein_g, carbs_g, fat_g, fiber_g}
    meal_plan JSONB DEFAULT '[]', -- Array of {day, meals: [{meal_type, foods, calories, macros}]}
    restrictions TEXT[],
    supplements_recommended TEXT[],
    notes TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nutrition_plans_patient_id ON nutrition_plans(patient_id);
CREATE INDEX idx_nutrition_plans_is_active ON nutrition_plans(is_active);

-- Workout Plans
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT, -- 'strength', 'cardio', 'flexibility', 'rehabilitation', etc.
    difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
    duration_weeks INTEGER,
    days_per_week INTEGER,
    workouts JSONB DEFAULT '[]', -- Array of {day, exercises: [{name, sets, reps, weight, duration, rest, notes}]}
    equipment_needed TEXT[],
    precautions TEXT,
    notes TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_patient_id ON workout_plans(patient_id);
CREATE INDEX idx_workout_plans_is_active ON workout_plans(is_active);

-- Supplements
CREATE TABLE supplements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    prescribed_by UUID REFERENCES physician_profiles(id),
    name TEXT NOT NULL,
    brand TEXT,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'daily', 'twice_daily', 'weekly', etc.
    timing TEXT, -- 'morning', 'evening', 'with_meals', etc.
    reason TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_supplements_patient_id ON supplements(patient_id);
CREATE INDEX idx_supplements_is_active ON supplements(is_active);

-- ============================================
-- 8. REFERRALS AND DME TABLES
-- ============================================

-- Referrals
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    referring_physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    referred_to_physician_id UUID REFERENCES physician_profiles(id) ON DELETE SET NULL,
    referred_to_practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    referred_to_external TEXT, -- For external referrals not in system
    specialty TEXT NOT NULL,
    urgency TEXT DEFAULT 'routine', -- 'routine', 'urgent', 'emergency'
    reason TEXT NOT NULL,
    diagnosis_codes TEXT[],
    clinical_notes TEXT,
    attachments JSONB DEFAULT '[]',
    status referral_status DEFAULT 'pending',
    status_updated_at TIMESTAMPTZ,
    status_updated_by UUID REFERENCES profiles(id),
    appointment_id UUID REFERENCES appointments(id),
    expiration_date DATE,
    insurance_authorization TEXT,
    authorization_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referrals_patient_id ON referrals(patient_id);
CREATE INDEX idx_referrals_referring_physician_id ON referrals(referring_physician_id);
CREATE INDEX idx_referrals_referred_to_physician_id ON referrals(referred_to_physician_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- DME Distributors
CREATE TABLE dme_distributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    fax TEXT,
    email TEXT,
    website TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    product_categories TEXT[],
    accepted_insurances TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dme_distributors_is_active ON dme_distributors(is_active);
CREATE INDEX idx_dme_distributors_product_categories ON dme_distributors USING GIN (product_categories);

-- DME Orders
CREATE TABLE dme_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    prescribing_physician_id UUID NOT NULL REFERENCES physician_profiles(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES dme_distributors(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE,
    items JSONB NOT NULL DEFAULT '[]', -- Array of {product_name, hcpcs_code, quantity, unit_price}
    diagnosis_codes TEXT[],
    medical_necessity TEXT,
    prescription_url TEXT,
    status dme_order_status DEFAULT 'pending',
    status_history JSONB DEFAULT '[]', -- Array of {status, timestamp, notes, updated_by}
    insurance_authorization TEXT,
    authorization_number TEXT,
    shipping_address JSONB,
    tracking_number TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMPTZ,
    total_amount DECIMAL(10, 2),
    insurance_covered DECIMAL(10, 2),
    patient_responsibility DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dme_orders_patient_id ON dme_orders(patient_id);
CREATE INDEX idx_dme_orders_prescribing_physician_id ON dme_orders(prescribing_physician_id);
CREATE INDEX idx_dme_orders_distributor_id ON dme_orders(distributor_id);
CREATE INDEX idx_dme_orders_status ON dme_orders(status);
CREATE INDEX idx_dme_orders_order_number ON dme_orders(order_number);

-- ============================================
-- 9. PAYMENTS TABLES
-- ============================================

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'trialing',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_practice_id ON subscriptions(practice_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Payment History
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_invoice_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL, -- 'succeeded', 'pending', 'failed', 'refunded'
    payment_method_type TEXT, -- 'card', 'bank_transfer', etc.
    payment_method_last4 TEXT,
    description TEXT,
    invoice_url TEXT,
    receipt_url TEXT,
    refunded_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX idx_payment_history_stripe_payment_intent_id ON payment_history(stripe_payment_intent_id);
CREATE INDEX idx_payment_history_status ON payment_history(status);
CREATE INDEX idx_payment_history_paid_at ON payment_history(paid_at);

-- ============================================
-- 10. AUDIT LOG TABLE
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- BRIN index for time-series optimization
CREATE INDEX idx_audit_logs_created_at_brin ON audit_logs USING BRIN (created_at);

-- ============================================
-- 11. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE physician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cme_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dme_distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE dme_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Physicians can view patient profiles (for their patients)
CREATE POLICY "Physicians can view patient profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM physician_profiles pp
            JOIN patient_profiles pat ON pat.primary_physician_id = pp.id
            WHERE pp.user_id = auth.uid() AND pat.user_id = profiles.id
        )
        OR
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN physician_profiles pp ON pp.id = a.physician_id
            JOIN patient_profiles pat ON pat.id = a.patient_id
            WHERE pp.user_id = auth.uid() AND pat.user_id = profiles.id
        )
    );

-- Staff can view profiles in their practice
CREATE POLICY "Staff can view practice profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            JOIN physician_profiles pp ON pp.practice_id = ps.practice_id
            WHERE ps.user_id = auth.uid() AND pp.user_id = profiles.id
        )
    );

-- ============================================
-- PRACTICES POLICIES
-- ============================================

-- Anyone can view active practices (public directory)
CREATE POLICY "Anyone can view active practices"
    ON practices FOR SELECT
    USING (is_active = true);

-- Practice admins can update their practice
CREATE POLICY "Practice admins can update practice"
    ON practices FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = practices.id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- ============================================
-- PHYSICIAN PROFILES POLICIES
-- ============================================

-- Public can view verified physicians
CREATE POLICY "Public can view verified physicians"
    ON physician_profiles FOR SELECT
    USING (is_verified = true);

-- Physicians can view and update their own profile
CREATE POLICY "Physicians can manage own profile"
    ON physician_profiles FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- PATIENT PROFILES POLICIES
-- ============================================

-- Patients can view and update their own profile
CREATE POLICY "Patients can manage own profile"
    ON patient_profiles FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Physicians can view their patients
CREATE POLICY "Physicians can view their patients"
    ON patient_profiles FOR SELECT
    USING (
        primary_physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM appointments a
            JOIN physician_profiles pp ON pp.id = a.physician_id
            WHERE pp.user_id = auth.uid() AND a.patient_id = patient_profiles.id
        )
    );

-- ============================================
-- PRACTICE STAFF POLICIES
-- ============================================

-- Staff can view their own record
CREATE POLICY "Staff can view own record"
    ON practice_staff FOR SELECT
    USING (user_id = auth.uid());

-- Practice admins can manage staff
CREATE POLICY "Practice admins can manage staff"
    ON practice_staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.practice_id = practice_staff.practice_id
            AND ps.user_id = auth.uid()
            AND ps.role = 'admin'
        )
    );

-- ============================================
-- HEALTH RECORDS POLICIES (HIPAA Critical)
-- ============================================

-- Patients can view their own records
CREATE POLICY "Patients can view own health records"
    ON health_records FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can view records they created or for their patients
CREATE POLICY "Physicians can view relevant health records"
    ON health_records FOR SELECT
    USING (
        created_by = auth.uid()
        OR
        physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
        OR
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
    );

-- Physicians can create health records for their patients
CREATE POLICY "Physicians can create health records"
    ON health_records FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM physician_profiles pp
            WHERE pp.user_id = auth.uid()
        )
        AND
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
    );

-- Physicians can update records they created
CREATE POLICY "Physicians can update own records"
    ON health_records FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- ============================================
-- LAB RESULTS POLICIES
-- ============================================

-- Patients can view their own lab results
CREATE POLICY "Patients can view own lab results"
    ON lab_results FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can view and manage lab results
CREATE POLICY "Physicians can manage lab results"
    ON lab_results FOR ALL
    USING (
        ordered_by IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
        OR
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
    );

-- ============================================
-- WEARABLE DATA POLICIES
-- ============================================

-- Patients can manage their own wearable data
CREATE POLICY "Patients can manage own wearable data"
    ON wearable_data FOR ALL
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can view their patients' wearable data
CREATE POLICY "Physicians can view patient wearable data"
    ON wearable_data FOR SELECT
    USING (
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
    );

-- ============================================
-- CME COURSES POLICIES
-- ============================================

-- Anyone can view active courses
CREATE POLICY "Anyone can view active CME courses"
    ON cme_courses FOR SELECT
    USING (is_active = true);

-- Admins can manage courses (simplified - extend as needed)
CREATE POLICY "Admins can manage CME courses"
    ON cme_courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- CME PROGRESS POLICIES
-- ============================================

-- Physicians can manage their own CME progress
CREATE POLICY "Physicians can manage own CME progress"
    ON cme_progress FOR ALL
    USING (
        physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- PROTOCOLS POLICIES
-- ============================================

-- Anyone can view published protocols
CREATE POLICY "Anyone can view published protocols"
    ON protocols FOR SELECT
    USING (is_published = true);

-- Physicians can create protocols
CREATE POLICY "Physicians can create protocols"
    ON protocols FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- Protocol creators can update their protocols
CREATE POLICY "Creators can update protocols"
    ON protocols FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
    ON appointments FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can view their appointments
CREATE POLICY "Physicians can view their appointments"
    ON appointments FOR SELECT
    USING (
        physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- Patients can create appointments
CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can create appointments for their patients
CREATE POLICY "Physicians can create patient appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- Appointment participants can update
CREATE POLICY "Participants can update appointments"
    ON appointments FOR UPDATE
    USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE user_id = auth.uid())
        OR
        physician_id IN (SELECT id FROM physician_profiles WHERE user_id = auth.uid())
    );

-- Practice staff can view appointments for their practice
CREATE POLICY "Staff can view practice appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.user_id = auth.uid()
            AND ps.practice_id = appointments.practice_id
        )
    );

-- ============================================
-- WELLNESS PLANS POLICIES (Nutrition, Workout, Supplements)
-- ============================================

-- Patients can manage their own nutrition plans
CREATE POLICY "Patients can manage own nutrition plans"
    ON nutrition_plans FOR ALL
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can view and create nutrition plans for their patients
CREATE POLICY "Physicians can manage patient nutrition plans"
    ON nutrition_plans FOR ALL
    USING (
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
    );

-- Patients can manage their own workout plans
CREATE POLICY "Patients can manage own workout plans"
    ON workout_plans FOR ALL
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can manage patient workout plans
CREATE POLICY "Physicians can manage patient workout plans"
    ON workout_plans FOR ALL
    USING (
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
    );

-- Patients can manage their own supplements
CREATE POLICY "Patients can manage own supplements"
    ON supplements FOR ALL
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can manage patient supplements
CREATE POLICY "Physicians can manage patient supplements"
    ON supplements FOR ALL
    USING (
        patient_id IN (
            SELECT pp.id FROM patient_profiles pp
            JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
            WHERE phys.user_id = auth.uid()
        )
        OR
        prescribed_by IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- REFERRALS POLICIES
-- ============================================

-- Patients can view their own referrals
CREATE POLICY "Patients can view own referrals"
    ON referrals FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Referring physicians can manage referrals they created
CREATE POLICY "Referring physicians can manage referrals"
    ON referrals FOR ALL
    USING (
        referring_physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- Referred-to physicians can view and update referrals
CREATE POLICY "Referred physicians can view referrals"
    ON referrals FOR SELECT
    USING (
        referred_to_physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Referred physicians can update referral status"
    ON referrals FOR UPDATE
    USING (
        referred_to_physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        referred_to_physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- DME POLICIES
-- ============================================

-- Anyone can view active DME distributors
CREATE POLICY "Anyone can view active DME distributors"
    ON dme_distributors FOR SELECT
    USING (is_active = true);

-- Patients can view their own DME orders
CREATE POLICY "Patients can view own DME orders"
    ON dme_orders FOR SELECT
    USING (
        patient_id IN (
            SELECT id FROM patient_profiles WHERE user_id = auth.uid()
        )
    );

-- Physicians can manage DME orders they prescribe
CREATE POLICY "Physicians can manage DME orders"
    ON dme_orders FOR ALL
    USING (
        prescribing_physician_id IN (
            SELECT id FROM physician_profiles WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (user_id = auth.uid());

-- Practice admins can view practice subscriptions
CREATE POLICY "Practice admins can view practice subscriptions"
    ON subscriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM practice_staff ps
            WHERE ps.user_id = auth.uid()
            AND ps.practice_id = subscriptions.practice_id
            AND ps.role = 'admin'
        )
    );

-- ============================================
-- PAYMENT HISTORY POLICIES
-- ============================================

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history"
    ON payment_history FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- 12. TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practices_updated_at
    BEFORE UPDATE ON practices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_physician_profiles_updated_at
    BEFORE UPDATE ON physician_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_staff_updated_at
    BEFORE UPDATE ON practice_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at
    BEFORE UPDATE ON health_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at
    BEFORE UPDATE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cme_courses_updated_at
    BEFORE UPDATE ON cme_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cme_progress_updated_at
    BEFORE UPDATE ON cme_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at
    BEFORE UPDATE ON protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_plans_updated_at
    BEFORE UPDATE ON nutrition_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at
    BEFORE UPDATE ON workout_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supplements_updated_at
    BEFORE UPDATE ON supplements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dme_distributors_updated_at
    BEFORE UPDATE ON dme_distributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dme_orders_updated_at
    BEFORE UPDATE ON dme_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUDIT LOGGING TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    audit_action_type audit_action;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        audit_action_type := 'create';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action_type := 'update';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        audit_action_type := 'delete';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

    -- Insert audit log (only for sensitive tables)
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        auth.uid(),
        audit_action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data,
        NOW()
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to HIPAA-sensitive tables
CREATE TRIGGER audit_health_records
    AFTER INSERT OR UPDATE OR DELETE ON health_records
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_lab_results
    AFTER INSERT OR UPDATE OR DELETE ON lab_results
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_patient_profiles
    AFTER INSERT OR UPDATE OR DELETE ON patient_profiles
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON appointments
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_referrals
    AFTER INSERT OR UPDATE OR DELETE ON referrals
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_dme_orders
    AFTER INSERT OR UPDATE OR DELETE ON dme_orders
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- AUTO-CREATE PROFILE ON AUTH USER CREATION
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- GENERATE MRN (Medical Record Number)
-- ============================================

CREATE OR REPLACE FUNCTION generate_mrn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mrn IS NULL THEN
        NEW.mrn := 'MRN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                   LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_patient_mrn
    BEFORE INSERT ON patient_profiles
    FOR EACH ROW EXECUTE FUNCTION generate_mrn();

-- ============================================
-- GENERATE DME ORDER NUMBER
-- ============================================

CREATE OR REPLACE FUNCTION generate_dme_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'DME-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                           LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_dme_order_num
    BEFORE INSERT ON dme_orders
    FOR EACH ROW EXECUTE FUNCTION generate_dme_order_number();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is a physician
CREATE OR REPLACE FUNCTION is_physician(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM physician_profiles WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if physician has access to patient
CREATE OR REPLACE FUNCTION physician_has_patient_access(physician_uuid UUID, patient_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM patient_profiles pp
        JOIN physician_profiles phys ON pp.primary_physician_id = phys.id
        WHERE phys.user_id = physician_uuid AND pp.id = patient_profile_id
    ) OR EXISTS (
        SELECT 1 FROM appointments a
        JOIN physician_profiles phys ON a.physician_id = phys.id
        WHERE phys.user_id = physician_uuid AND a.patient_id = patient_profile_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to all tables for authenticated users (RLS will filter)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant access to sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- END OF MIGRATION
-- ============================================

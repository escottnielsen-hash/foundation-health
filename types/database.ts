export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// Enum types matching SQL schema
// ============================================

export type UserRole = 'admin' | 'physician' | 'patient' | 'staff'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing' | 'paused'
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise'
export type ReferralStatus = 'pending' | 'accepted' | 'completed' | 'declined' | 'expired'
export type DmeOrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
export type CmeStatus = 'not_started' | 'in_progress' | 'completed' | 'expired'
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'share'
export type LocationType = 'hub' | 'spoke' | 'mobile' | 'virtual'
export type MembershipTierName = 'platinum' | 'gold' | 'silver'
export type MembershipStatus = 'active' | 'past_due' | 'cancelled' | 'paused'
export type EncounterStatus = 'checked_in' | 'in_progress' | 'completed' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'void' | 'refunded'
export type ClaimStatus = 'draft' | 'submitted' | 'acknowledged' | 'pending' | 'denied' | 'partially_paid' | 'paid' | 'appealed'
export type IDRStatus = 'initiated' | 'negotiation' | 'submitted' | 'hearing_scheduled' | 'decided' | 'closed'

// ============================================
// Core tables
// ============================================

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  role: UserRole
  date_of_birth?: string | null
  gender?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  timezone?: string | null
  preferences?: Json
  onboarding_completed: boolean
  email_verified: boolean
  phone_verified: boolean
  two_factor_enabled: boolean
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface Practice {
  id: string
  name: string
  npi?: string | null
  tax_id?: string | null
  phone?: string | null
  fax?: string | null
  email?: string | null
  website?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  logo_url?: string | null
  settings?: Json
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PhysicianProfile {
  id: string
  user_id: string
  practice_id?: string | null
  npi?: string | null
  license_number?: string | null
  license_state?: string | null
  specialty?: string | null
  subspecialties?: string[] | null
  board_certifications?: string[] | null
  credentials?: string | null
  years_of_experience?: number | null
  education?: Json
  avatar_url?: string | null
  is_active: boolean
  medical_school?: string | null
  graduation_year?: number | null
  residency?: string | null
  fellowship?: string | null
  accepting_new_patients: boolean
  consultation_fee?: number | null
  bio?: string | null
  languages?: string[]
  cme_credits_earned: number
  cme_credits_required: number
  cme_cycle_end_date?: string | null
  is_verified: boolean
  verified_at?: string | null
  created_at: string
  updated_at: string
}

export interface ProviderLocation {
  id: string
  physician_id: string
  location_id: string
  is_primary: boolean
  days_available?: string[] | null
  created_at: string
  updated_at: string
}

export interface ProviderService {
  id: string
  physician_id: string
  service_id: string
  is_primary: boolean
  custom_price?: number | null
  created_at: string
  updated_at: string
}

export interface PatientProfile {
  id: string
  user_id: string
  primary_physician_id?: string | null
  mrn?: string | null
  insurance_provider?: string | null
  insurance_policy_number?: string | null
  insurance_group_number?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
  allergies?: string[] | null
  medications?: string[] | null
  medical_conditions?: string[] | null
  blood_type?: string | null
  height_inches?: number | null
  weight_lbs?: number | null
  bmi?: number | null
  health_goals?: string[] | null
  dietary_restrictions?: string[] | null
  activity_level?: string | null
  smoking_status?: string | null
  alcohol_consumption?: string | null
  created_at: string
  updated_at: string
}

export interface PracticeStaff {
  id: string
  practice_id: string
  user_id: string
  role: string
  permissions?: Json
  is_active: boolean
  hired_at?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Health records tables
// ============================================

export interface HealthRecord {
  id: string
  patient_id: string
  physician_id?: string | null
  record_type: string
  title: string
  description?: string | null
  record_date: string
  icd10_codes?: string[] | null
  cpt_codes?: string[] | null
  notes?: string | null
  attachments?: Json
  is_confidential: boolean
  shared_with?: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface LabResult {
  id: string
  patient_id: string
  ordered_by?: string | null
  health_record_id?: string | null
  lab_name?: string | null
  test_name: string
  test_code?: string | null
  specimen_type?: string | null
  collection_date: string
  result_date?: string | null
  status: string
  results: Json
  interpretation?: string | null
  is_abnormal: boolean
  pdf_url?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at: string
}

export interface WearableData {
  id: string
  patient_id: string
  device_type: string
  device_id?: string | null
  metric_type: string
  value: number
  unit: string
  recorded_at: string
  metadata?: Json
  created_at: string
}

// ============================================
// CME / Education tables
// ============================================

export interface CmeCourse {
  id: string
  title: string
  description?: string | null
  provider: string
  accreditation_body?: string | null
  credit_hours: number
  credit_type: string
  specialty_tags?: string[] | null
  difficulty_level?: string | null
  duration_minutes?: number | null
  content_url?: string | null
  thumbnail_url?: string | null
  syllabus?: Json
  learning_objectives?: string[] | null
  is_active: boolean
  is_free: boolean
  price?: number | null
  expiration_date?: string | null
  created_at: string
  updated_at: string
}

export interface CmeProgress {
  id: string
  physician_id: string
  course_id: string
  status: CmeStatus
  progress_percent: number
  started_at?: string | null
  completed_at?: string | null
  certificate_url?: string | null
  quiz_scores?: Json
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Protocol {
  id: string
  title: string
  description?: string | null
  category: string
  specialty?: string | null
  version: string
  content: string
  attachments?: Json
  references?: string[] | null
  icd10_codes?: string[] | null
  created_by?: string | null
  approved_by?: string | null
  approved_at?: string | null
  is_published: boolean
  is_template: boolean
  parent_protocol_id?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Appointments
// ============================================

export interface Appointment {
  id: string
  patient_id: string
  physician_id: string
  practice_id?: string | null
  location_id?: string | null
  appointment_type: string
  title?: string | null
  description?: string | null
  scheduled_start: string
  scheduled_end: string
  actual_start?: string | null
  actual_end?: string | null
  status: AppointmentStatus
  is_telehealth: boolean
  telehealth_url?: string | null
  location?: string | null
  room?: string | null
  reason_for_visit?: string | null
  symptoms?: string[] | null
  notes?: string | null
  pre_visit_instructions?: string | null
  reminder_sent: boolean
  reminder_sent_at?: string | null
  cancelled_at?: string | null
  cancelled_by?: string | null
  cancellation_reason?: string | null
  no_show_fee?: number | null
  created_by: string
  created_at: string
  updated_at: string
}

// ============================================
// Wellness tables
// ============================================

export interface NutritionPlan {
  id: string
  patient_id: string
  created_by?: string | null
  title: string
  description?: string | null
  goal?: string | null
  daily_calories?: number | null
  macros?: Json
  meal_plan?: Json
  restrictions?: string[] | null
  supplements_recommended?: string[] | null
  notes?: string | null
  start_date?: string | null
  end_date?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkoutPlan {
  id: string
  patient_id: string
  created_by?: string | null
  title: string
  description?: string | null
  goal?: string | null
  difficulty_level?: string | null
  duration_weeks?: number | null
  days_per_week?: number | null
  workouts?: Json
  equipment_needed?: string[] | null
  precautions?: string | null
  notes?: string | null
  start_date?: string | null
  end_date?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplement {
  id: string
  patient_id: string
  prescribed_by?: string | null
  name: string
  brand?: string | null
  dosage: string
  frequency: string
  timing?: string | null
  reason?: string | null
  start_date?: string | null
  end_date?: string | null
  is_active: boolean
  notes?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Referrals & DME
// ============================================

export interface Referral {
  id: string
  patient_id: string
  referring_physician_id: string
  referred_to_physician_id?: string | null
  referred_to_practice_id?: string | null
  referred_to_external?: string | null
  specialty: string
  urgency: string
  reason: string
  diagnosis_codes?: string[] | null
  clinical_notes?: string | null
  attachments?: Json
  status: ReferralStatus
  status_updated_at?: string | null
  status_updated_by?: string | null
  appointment_id?: string | null
  expiration_date?: string | null
  insurance_authorization?: string | null
  authorization_number?: string | null
  created_at: string
  updated_at: string
}

export interface DmeDistributor {
  id: string
  name: string
  contact_name?: string | null
  phone?: string | null
  fax?: string | null
  email?: string | null
  website?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  country?: string | null
  product_categories?: string[] | null
  accepted_insurances?: string[] | null
  is_active: boolean
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface DmeOrder {
  id: string
  patient_id: string
  prescribing_physician_id: string
  distributor_id?: string | null
  order_number?: string | null
  items: Json
  diagnosis_codes?: string[] | null
  medical_necessity?: string | null
  prescription_url?: string | null
  status: DmeOrderStatus
  status_history?: Json
  insurance_authorization?: string | null
  authorization_number?: string | null
  shipping_address?: Json
  tracking_number?: string | null
  estimated_delivery?: string | null
  delivered_at?: string | null
  total_amount?: number | null
  insurance_covered?: number | null
  patient_responsibility?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Payments / Subscriptions
// ============================================

export interface Subscription {
  id: string
  user_id: string
  practice_id?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  tier: SubscriptionTier
  status: SubscriptionStatus
  current_period_start?: string | null
  current_period_end?: string | null
  cancel_at_period_end: boolean
  cancelled_at?: string | null
  trial_start?: string | null
  trial_end?: string | null
  metadata?: Json
  created_at: string
  updated_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  subscription_id?: string | null
  stripe_payment_intent_id?: string | null
  stripe_invoice_id?: string | null
  amount: number
  currency: string
  status: string
  payment_method_type?: string | null
  payment_method_last4?: string | null
  description?: string | null
  invoice_url?: string | null
  receipt_url?: string | null
  refunded_amount: number
  refund_reason?: string | null
  metadata?: Json
  paid_at?: string | null
  created_at: string
}

// ============================================
// Audit
// ============================================

export interface AuditLog {
  id: string
  user_id?: string | null
  action: AuditAction
  table_name: string
  record_id?: string | null
  old_values?: Json
  new_values?: Json
  ip_address?: string | null
  user_agent?: string | null
  session_id?: string | null
  metadata?: Json
  created_at: string
}

// ============================================
// Phase 1: Locations
// ============================================

export interface Location {
  id: string
  practice_id: string
  name: string
  location_type: LocationType
  parent_location_id?: string | null
  is_critical_access: boolean
  slug?: string | null
  description?: string | null
  tagline?: string | null
  hero_image_url?: string | null
  amenities?: Json
  features?: Json
  travel_info?: string | null
  accommodation_info?: string | null
  concierge_info?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  county?: string | null
  country?: string | null
  phone?: string | null
  fax?: string | null
  email?: string | null
  operating_hours?: Json
  timezone?: string | null
  latitude?: number | null
  longitude?: number | null
  npi?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LocationService {
  id: string
  location_id: string
  service_id: string
  is_available: boolean
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1: Membership
// ============================================

export interface MembershipTier {
  id: string
  practice_id: string
  name: MembershipTierName
  display_name: string
  description?: string | null
  monthly_price: number
  annual_price?: number | null
  stripe_monthly_price_id?: string | null
  stripe_annual_price_id?: string | null
  features?: Json
  visit_discount_percent: number
  lab_discount_percent: number
  imaging_discount_percent: number
  telehealth_included: boolean
  max_telehealth_visits?: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PatientMembership {
  id: string
  patient_id: string
  tier_id: string
  status: MembershipStatus
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  billing_interval: 'monthly' | 'annual'
  current_period_start?: string | null
  current_period_end?: string | null
  cancel_at_period_end: boolean
  cancelled_at?: string | null
  cancellation_reason?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1: Service Catalog
// ============================================

export interface ServiceCatalog {
  id: string
  practice_id: string
  name: string
  description?: string | null
  category?: string | null
  cpt_code?: string | null
  base_price: number
  platinum_price?: number | null
  gold_price?: number | null
  silver_price?: number | null
  duration_minutes?: number | null
  is_telehealth_eligible: boolean
  requires_referral: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1: Encounters
// ============================================

export interface Encounter {
  id: string
  appointment_id?: string | null
  patient_id: string
  physician_id: string
  location_id?: string | null
  status: EncounterStatus
  check_in_time?: string | null
  check_out_time?: string | null
  chief_complaint?: string | null
  diagnosis_codes?: string[] | null
  procedure_codes?: string[] | null
  visit_notes?: string | null
  plan?: string | null
  follow_up_instructions?: string | null
  follow_up_date?: string | null
  vitals?: Json
  is_telehealth: boolean
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1: Invoices
// ============================================

export interface Invoice {
  id: string
  invoice_number?: string | null
  patient_id: string
  encounter_id?: string | null
  practice_id: string
  status: InvoiceStatus
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  amount_paid: number
  amount_due: number
  membership_tier_applied?: MembershipTierName | null
  line_items?: Json
  notes?: string | null
  due_date?: string | null
  paid_at?: string | null
  stripe_payment_intent_id?: string | null
  stripe_invoice_id?: string | null
  issued_at?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1: Insurance
// ============================================

export interface InsurancePayer {
  id: string
  name: string
  payer_id?: string | null
  phone?: string | null
  fax?: string | null
  email?: string | null
  website?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  claims_address_line1?: string | null
  claims_address_line2?: string | null
  claims_city?: string | null
  claims_state?: string | null
  claims_zip_code?: string | null
  is_active: boolean
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface InsuranceClaim {
  id: string
  claim_number?: string | null
  patient_id: string
  encounter_id?: string | null
  invoice_id?: string | null
  payer_id: string
  practice_id: string
  policy_number?: string | null
  group_number?: string | null
  subscriber_name?: string | null
  subscriber_dob?: string | null
  subscriber_relationship: string
  status: ClaimStatus
  claim_type: string
  service_date: string
  diagnosis_codes?: string[] | null
  procedure_codes?: string[] | null
  billed_amount: number
  allowed_amount?: number | null
  paid_amount?: number | null
  patient_responsibility?: number | null
  adjustment_amount?: number | null
  denial_reason?: string | null
  appeal_deadline?: string | null
  submitted_at?: string | null
  response_received_at?: string | null
  eob_url?: string | null
  notes?: string | null
  status_history?: Json
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1: IDR (Independent Dispute Resolution)
// ============================================

export interface IDRCase {
  id: string
  case_number?: string | null
  claim_id: string
  patient_id: string
  payer_id: string
  practice_id: string
  status: IDRStatus
  disputed_amount: number
  provider_proposed_amount?: number | null
  payer_proposed_amount?: number | null
  final_determined_amount?: number | null
  qualifying_payment_amount?: number | null
  open_negotiation_start?: string | null
  open_negotiation_end?: string | null
  idr_entity?: string | null
  idr_submission_date?: string | null
  idr_decision_date?: string | null
  prevailing_party?: string | null
  supporting_documents?: Json
  timeline?: Json
  notes?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Phase 1c: Superbills
// ============================================

export type SuperbillStatus = 'generated' | 'submitted_to_insurance' | 'reimbursed' | 'denied' | 'pending_review'

export interface DiagnosisCodeEntry {
  code: string
  description: string
}

export interface ProcedureCodeEntry {
  code: string
  description: string
  modifier?: string | null
  charge_cents: number
}

export interface Superbill {
  id: string
  patient_id: string
  encounter_id?: string | null
  provider_id: string
  location_id?: string | null
  date_of_service: string
  place_of_service_code: string
  diagnosis_codes: DiagnosisCodeEntry[]
  procedure_codes: ProcedureCodeEntry[]
  total_charges_cents: number
  status: SuperbillStatus
  insurance_submitted_at?: string | null
  reimbursement_amount_cents?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Convenience type aliases
// ============================================

export type Tables = {
  profiles: Profile
  practices: Practice
  physician_profiles: PhysicianProfile
  patient_profiles: PatientProfile
  practice_staff: PracticeStaff
  health_records: HealthRecord
  lab_results: LabResult
  wearable_data: WearableData
  cme_courses: CmeCourse
  cme_progress: CmeProgress
  protocols: Protocol
  appointments: Appointment
  nutrition_plans: NutritionPlan
  workout_plans: WorkoutPlan
  supplements: Supplement
  referrals: Referral
  dme_distributors: DmeDistributor
  dme_orders: DmeOrder
  subscriptions: Subscription
  payment_history: PaymentHistory
  audit_logs: AuditLog
  locations: Location
  membership_tiers: MembershipTier
  patient_memberships: PatientMembership
  service_catalog: ServiceCatalog
  encounters: Encounter
  invoices: Invoice
  insurance_payers: InsurancePayer
  insurance_claims: InsuranceClaim
  idr_cases: IDRCase
  provider_locations: ProviderLocation
  provider_services: ProviderService
  location_services: LocationService
  superbills: Superbill
}

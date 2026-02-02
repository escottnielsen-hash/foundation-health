export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'physician' | 'patient' | 'staff'

export interface Profile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
  phone?: string
  avatar_url?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface PhysicianProfile {
  id: string
  npi_number: string
  license_number: string
  license_state: string
  license_expiry: string
  specialty: string
  subspecialties?: string[]
  practice_id?: string
  verification_status: 'pending' | 'verified' | 'rejected'
  created_at: string
}

export interface PatientProfile {
  id: string
  mrn?: string
  insurance_provider?: string
  insurance_id?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  primary_physician_id?: string
  hipaa_acknowledged_at?: string
  created_at: string
}

export interface Practice {
  id: string
  name: string
  address_line1: string
  city: string
  state: string
  zip_code: string
  phone: string
  email: string
  subscription_tier: 'basic' | 'pro' | 'enterprise'
  subscription_status: 'trial' | 'active' | 'cancelled'
  created_at: string
}

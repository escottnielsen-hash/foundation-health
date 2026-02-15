import type { AuditAction, UserRole, Json } from '@/types/database'

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timezone: string
  theme: 'light' | 'dark' | 'system'
  email_notifications: boolean
  sms_notifications: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  date_format: 'MM/DD/YYYY',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme: 'system',
  email_notifications: true,
  sms_notifications: false,
}

// ============================================
// Password Change
// ============================================

export interface PasswordChangeFormData {
  current_password: string
  new_password: string
  confirm_password: string
}

// ============================================
// Audit Log
// ============================================

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: AuditAction
  table_name: string
  record_id: string | null
  old_values: Json | null
  new_values: Json | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  metadata: Json | null
  created_at: string
  // Joined profile info
  user_email?: string | null
  user_full_name?: string | null
}

export interface AuditLogFilter {
  date_from?: string
  date_to?: string
  user_id?: string
  action?: AuditAction | ''
  table_name?: string
  page?: number
  per_page?: number
}

export interface AuditLogStats {
  total_entries: number
  by_action: Record<string, number>
}

// ============================================
// User Management
// ============================================

export interface UserListItem {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  email_verified: boolean
  onboarding_completed: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface UserDetail extends UserListItem {
  date_of_birth: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  timezone: string | null
  two_factor_enabled: boolean
  phone_verified: boolean
}

export interface UserActivitySummary {
  total_appointments: number
  total_encounters: number
  total_claims: number
  total_invoices: number
  last_login_at: string | null
}

export interface UserListFilter {
  search?: string
  role?: UserRole | ''
  page?: number
  per_page?: number
}

// ============================================
// Settings Profile (role-adaptive)
// ============================================

export interface SettingsProfileData {
  first_name: string
  last_name: string
  phone: string
  date_of_birth?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  bio?: string
}

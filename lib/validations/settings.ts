import { z } from 'zod'

// ============================================
// Profile update schema (shared across roles)
// ============================================

export const settingsProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or fewer'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or fewer'),
  phone: z
    .string()
    .max(20, 'Phone number must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  address_line1: z
    .string()
    .max(200, 'Address must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  address_line2: z
    .string()
    .max(200, 'Address line 2 must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(50, 'State must be 50 characters or fewer')
    .optional()
    .or(z.literal('')),
  zip_code: z
    .string()
    .max(10, 'ZIP code must be 10 characters or fewer')
    .optional()
    .or(z.literal('')),
  emergency_contact_name: z
    .string()
    .max(200, 'Emergency contact name must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  emergency_contact_phone: z
    .string()
    .max(20, 'Emergency contact phone must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  emergency_contact_relationship: z
    .string()
    .max(100, 'Relationship must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(2000, 'Bio must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type SettingsProfileFormData = z.infer<typeof settingsProfileSchema>

// ============================================
// Password change schema
// ============================================

export const passwordChangeSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z
      .string()
      .min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

// ============================================
// Preferences schema
// ============================================

export const preferencesSchema = z.object({
  date_format: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  timezone: z.string().min(1, 'Timezone is required'),
  theme: z.enum(['light', 'dark', 'system']),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
})

export type PreferencesFormData = z.infer<typeof preferencesSchema>

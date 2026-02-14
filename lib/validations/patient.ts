import { z } from 'zod'

// ============================================
// Profile update validation schema (Zod v4)
// ============================================

export const profileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or fewer'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or fewer'),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'Phone number must be 20 characters or fewer')
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
})

export type ProfileFormData = z.infer<typeof profileSchema>

// ============================================
// Document filter validation schema
// ============================================

export const documentFilterSchema = z.object({
  record_type: z
    .string()
    .optional()
    .or(z.literal('')),
})

export type DocumentFilterData = z.infer<typeof documentFilterSchema>

// ============================================
// US States for select dropdown
// ============================================

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
] as const

// ============================================
// Health record type constants
// ============================================

export const RECORD_TYPES = [
  { value: 'visit_note', label: 'Visit Note' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'clinical_note', label: 'Clinical Note' },
  { value: 'referral', label: 'Referral' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'other', label: 'Other' },
] as const

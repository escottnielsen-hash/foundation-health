import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const patientRegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  hipaaConsent: z.boolean().refine(v => v === true, 'HIPAA acknowledgment required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const physicianRegisterSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  npi: z.string().length(10, 'NPI must be exactly 10 digits').regex(/^\d+$/, 'NPI must be numeric'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseState: z.string().length(2, 'Use 2-letter state code'),
  specialty: z.string().min(1, 'Specialty is required'),
  hipaaConsent: z.boolean().refine(v => v === true, 'Required'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>
export type PhysicianRegisterInput = z.infer<typeof physicianRegisterSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

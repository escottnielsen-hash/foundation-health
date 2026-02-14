'use server'

import { createClient } from '@/lib/supabase/server'
import {
  verificationRequestSchema,
  insuranceFilterSchema,
  verificationIdSchema,
} from '@/lib/validations/insurance'
import type { InsuranceVerification, VerificationStatus } from '@/types/database'
import { ZodError } from 'zod'

// ============================================
// Result types for server actions
// ============================================

interface ActionSuccess<T> {
  success: true
  data: T
}

interface ActionError {
  success: false
  error: string
  fieldErrors?: Record<string, string>
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// OON Benefits summary type
// ============================================

export interface OonBenefitsSummary {
  verification: InsuranceVerification
  oon_deductible_remaining: number
  oon_oop_remaining: number
  inn_deductible_display: number | null
  inn_coinsurance_display: number | null
  oon_deductible_display: number | null
  oon_coinsurance_display: number | null
  deductible_met_pct: number
  oop_met_pct: number
}

// ============================================
// Reimbursement estimate type
// ============================================

export interface ReimbursementEstimate {
  service_cost: number
  allowed_amount: number
  deductible_remaining: number
  deductible_applied: number
  amount_after_deductible: number
  coinsurance_pct: number
  insurance_pays: number
  patient_responsibility: number
}

// ============================================
// Insurance filter types
// ============================================

interface InsuranceFilters {
  status?: string
}

// ============================================
// getPatientPolicies
// ============================================

export async function getPatientPolicies(
  userId: string
): Promise<ActionResult<InsuranceVerification[]>> {
  try {
    const supabase = await createClient()

    // Get all verifications for this patient (they serve as policy records)
    const { data: verifications, error } = await supabase
      .from('insurance_verifications')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: 'Could not load insurance policies. Please try again.',
      }
    }

    const result: InsuranceVerification[] = (verifications ?? []).map((v) => {
      const rec = v as Record<string, unknown>
      return {
        id: rec.id as string,
        patient_id: rec.patient_id as string,
        insurance_policy_id: (rec.insurance_policy_id as string) ?? null,
        payer_name: rec.payer_name as string,
        payer_id: (rec.payer_id as string) ?? null,
        member_id: rec.member_id as string,
        group_number: (rec.group_number as string) ?? null,
        plan_type: (rec.plan_type as string) ?? null,
        oon_deductible_individual: (rec.oon_deductible_individual as number) ?? null,
        oon_deductible_family: (rec.oon_deductible_family as number) ?? null,
        oon_deductible_met: (rec.oon_deductible_met as number) ?? null,
        oon_out_of_pocket_max: (rec.oon_out_of_pocket_max as number) ?? null,
        oon_out_of_pocket_met: (rec.oon_out_of_pocket_met as number) ?? null,
        oon_coinsurance_pct: (rec.oon_coinsurance_pct as number) ?? null,
        inn_deductible_individual: (rec.inn_deductible_individual as number) ?? null,
        inn_coinsurance_pct: (rec.inn_coinsurance_pct as number) ?? null,
        verification_status: rec.verification_status as VerificationStatus,
        verified_at: (rec.verified_at as string) ?? null,
        verified_by: (rec.verified_by as string) ?? null,
        reference_number: (rec.reference_number as string) ?? null,
        notes: (rec.notes as string) ?? null,
        estimated_allowed_amount: (rec.estimated_allowed_amount as number) ?? null,
        estimated_patient_responsibility: (rec.estimated_patient_responsibility as number) ?? null,
        created_at: rec.created_at as string,
        updated_at: rec.updated_at as string,
      }
    })

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading insurance policies.',
    }
  }
}

// ============================================
// getInsuranceVerification
// ============================================

export async function getInsuranceVerification(
  verificationId: string,
  userId: string
): Promise<ActionResult<InsuranceVerification>> {
  try {
    const idResult = verificationIdSchema.safeParse({ id: verificationId })
    if (!idResult.success) {
      return {
        success: false,
        error: 'Invalid verification ID.',
      }
    }

    const supabase = await createClient()

    const { data: verification, error } = await supabase
      .from('insurance_verifications')
      .select('*')
      .eq('id', verificationId)
      .eq('patient_id', userId)
      .single()

    if (error || !verification) {
      return {
        success: false,
        error: 'Verification not found or you do not have access.',
      }
    }

    const rec = verification as Record<string, unknown>
    const result: InsuranceVerification = {
      id: rec.id as string,
      patient_id: rec.patient_id as string,
      insurance_policy_id: (rec.insurance_policy_id as string) ?? null,
      payer_name: rec.payer_name as string,
      payer_id: (rec.payer_id as string) ?? null,
      member_id: rec.member_id as string,
      group_number: (rec.group_number as string) ?? null,
      plan_type: (rec.plan_type as string) ?? null,
      oon_deductible_individual: (rec.oon_deductible_individual as number) ?? null,
      oon_deductible_family: (rec.oon_deductible_family as number) ?? null,
      oon_deductible_met: (rec.oon_deductible_met as number) ?? null,
      oon_out_of_pocket_max: (rec.oon_out_of_pocket_max as number) ?? null,
      oon_out_of_pocket_met: (rec.oon_out_of_pocket_met as number) ?? null,
      oon_coinsurance_pct: (rec.oon_coinsurance_pct as number) ?? null,
      inn_deductible_individual: (rec.inn_deductible_individual as number) ?? null,
      inn_coinsurance_pct: (rec.inn_coinsurance_pct as number) ?? null,
      verification_status: rec.verification_status as VerificationStatus,
      verified_at: (rec.verified_at as string) ?? null,
      verified_by: (rec.verified_by as string) ?? null,
      reference_number: (rec.reference_number as string) ?? null,
      notes: (rec.notes as string) ?? null,
      estimated_allowed_amount: (rec.estimated_allowed_amount as number) ?? null,
      estimated_patient_responsibility: (rec.estimated_patient_responsibility as number) ?? null,
      created_at: rec.created_at as string,
      updated_at: rec.updated_at as string,
    }

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the verification.',
    }
  }
}

// ============================================
// getPatientVerifications
// ============================================

export async function getPatientVerifications(
  userId: string,
  filters?: InsuranceFilters
): Promise<ActionResult<InsuranceVerification[]>> {
  try {
    if (filters) {
      const filterResult = insuranceFilterSchema.safeParse(filters)
      if (!filterResult.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of (filterResult.error as ZodError).issues) {
          const fieldName = issue.path.join('.')
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message
          }
        }
        return {
          success: false,
          error: 'Invalid filter parameters.',
          fieldErrors,
        }
      }
    }

    const supabase = await createClient()

    let query = supabase
      .from('insurance_verifications')
      .select('*')
      .eq('patient_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('verification_status', filters.status)
    }

    const { data: verifications, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load verifications. Please try again.',
      }
    }

    const result: InsuranceVerification[] = (verifications ?? []).map((v) => {
      const rec = v as Record<string, unknown>
      return {
        id: rec.id as string,
        patient_id: rec.patient_id as string,
        insurance_policy_id: (rec.insurance_policy_id as string) ?? null,
        payer_name: rec.payer_name as string,
        payer_id: (rec.payer_id as string) ?? null,
        member_id: rec.member_id as string,
        group_number: (rec.group_number as string) ?? null,
        plan_type: (rec.plan_type as string) ?? null,
        oon_deductible_individual: (rec.oon_deductible_individual as number) ?? null,
        oon_deductible_family: (rec.oon_deductible_family as number) ?? null,
        oon_deductible_met: (rec.oon_deductible_met as number) ?? null,
        oon_out_of_pocket_max: (rec.oon_out_of_pocket_max as number) ?? null,
        oon_out_of_pocket_met: (rec.oon_out_of_pocket_met as number) ?? null,
        oon_coinsurance_pct: (rec.oon_coinsurance_pct as number) ?? null,
        inn_deductible_individual: (rec.inn_deductible_individual as number) ?? null,
        inn_coinsurance_pct: (rec.inn_coinsurance_pct as number) ?? null,
        verification_status: rec.verification_status as VerificationStatus,
        verified_at: (rec.verified_at as string) ?? null,
        verified_by: (rec.verified_by as string) ?? null,
        reference_number: (rec.reference_number as string) ?? null,
        notes: (rec.notes as string) ?? null,
        estimated_allowed_amount: (rec.estimated_allowed_amount as number) ?? null,
        estimated_patient_responsibility: (rec.estimated_patient_responsibility as number) ?? null,
        created_at: rec.created_at as string,
        updated_at: rec.updated_at as string,
      }
    })

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading verifications.',
    }
  }
}

// ============================================
// requestVerification
// ============================================

export async function requestVerification(
  userId: string,
  formData: unknown
): Promise<ActionResult<InsuranceVerification>> {
  try {
    const parseResult = verificationRequestSchema.safeParse(formData)
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (parseResult.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return {
        success: false,
        error: 'Please correct the errors in the form.',
        fieldErrors,
      }
    }

    const validData = parseResult.data

    const supabase = await createClient()

    const insertData: Record<string, unknown> = {
      patient_id: userId,
      payer_name: validData.payer_name,
      member_id: validData.member_id,
      verification_status: 'pending',
    }

    if (validData.payer_id && validData.payer_id !== '') {
      insertData.payer_id = validData.payer_id
    }
    if (validData.group_number && validData.group_number !== '') {
      insertData.group_number = validData.group_number
    }
    if (validData.plan_type) {
      insertData.plan_type = validData.plan_type
    }
    if (validData.notes && validData.notes !== '') {
      insertData.notes = validData.notes
    }

    const { data: newVerification, error } = await supabase
      .from('insurance_verifications')
      .insert(insertData)
      .select()
      .single()

    if (error || !newVerification) {
      return {
        success: false,
        error: 'Failed to submit verification request. Please try again.',
      }
    }

    const rec = newVerification as Record<string, unknown>
    const result: InsuranceVerification = {
      id: rec.id as string,
      patient_id: rec.patient_id as string,
      insurance_policy_id: (rec.insurance_policy_id as string) ?? null,
      payer_name: rec.payer_name as string,
      payer_id: (rec.payer_id as string) ?? null,
      member_id: rec.member_id as string,
      group_number: (rec.group_number as string) ?? null,
      plan_type: (rec.plan_type as string) ?? null,
      oon_deductible_individual: (rec.oon_deductible_individual as number) ?? null,
      oon_deductible_family: (rec.oon_deductible_family as number) ?? null,
      oon_deductible_met: (rec.oon_deductible_met as number) ?? null,
      oon_out_of_pocket_max: (rec.oon_out_of_pocket_max as number) ?? null,
      oon_out_of_pocket_met: (rec.oon_out_of_pocket_met as number) ?? null,
      oon_coinsurance_pct: (rec.oon_coinsurance_pct as number) ?? null,
      inn_deductible_individual: (rec.inn_deductible_individual as number) ?? null,
      inn_coinsurance_pct: (rec.inn_coinsurance_pct as number) ?? null,
      verification_status: rec.verification_status as VerificationStatus,
      verified_at: (rec.verified_at as string) ?? null,
      verified_by: (rec.verified_by as string) ?? null,
      reference_number: (rec.reference_number as string) ?? null,
      notes: (rec.notes as string) ?? null,
      estimated_allowed_amount: (rec.estimated_allowed_amount as number) ?? null,
      estimated_patient_responsibility: (rec.estimated_patient_responsibility as number) ?? null,
      created_at: rec.created_at as string,
      updated_at: rec.updated_at as string,
    }

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while submitting the verification request.',
    }
  }
}

// ============================================
// getOonBenefitsSummary
// ============================================

export async function getOonBenefitsSummary(
  verificationId: string,
  userId: string
): Promise<ActionResult<OonBenefitsSummary>> {
  try {
    const verificationResult = await getInsuranceVerification(verificationId, userId)
    if (!verificationResult.success) {
      return verificationResult
    }

    const verification = verificationResult.data

    const oonDeductible = verification.oon_deductible_individual ?? 0
    const oonDeductibleMet = verification.oon_deductible_met ?? 0
    const oonDeductibleRemaining = Math.max(0, oonDeductible - oonDeductibleMet)

    const oonOopMax = verification.oon_out_of_pocket_max ?? 0
    const oonOopMet = verification.oon_out_of_pocket_met ?? 0
    const oonOopRemaining = Math.max(0, oonOopMax - oonOopMet)

    const deductibleMetPct = oonDeductible > 0
      ? Math.min(100, Math.round((oonDeductibleMet / oonDeductible) * 100))
      : 0

    const oopMetPct = oonOopMax > 0
      ? Math.min(100, Math.round((oonOopMet / oonOopMax) * 100))
      : 0

    return {
      success: true,
      data: {
        verification,
        oon_deductible_remaining: oonDeductibleRemaining,
        oon_oop_remaining: oonOopRemaining,
        inn_deductible_display: verification.inn_deductible_individual ?? null,
        inn_coinsurance_display: verification.inn_coinsurance_pct ?? null,
        oon_deductible_display: verification.oon_deductible_individual ?? null,
        oon_coinsurance_display: verification.oon_coinsurance_pct ?? null,
        deductible_met_pct: deductibleMetPct,
        oop_met_pct: oopMetPct,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while calculating benefits summary.',
    }
  }
}

// ============================================
// calculateReimbursementEstimate
// ============================================

export async function calculateReimbursementEstimate(
  verificationId: string,
  userId: string,
  serviceCostCents: number
): Promise<ActionResult<ReimbursementEstimate>> {
  try {
    const verificationResult = await getInsuranceVerification(verificationId, userId)
    if (!verificationResult.success) {
      return verificationResult
    }

    const v = verificationResult.data

    const oonDeductible = v.oon_deductible_individual ?? 0
    const oonDeductibleMet = v.oon_deductible_met ?? 0
    const oonDeductibleRemaining = Math.max(0, oonDeductible - oonDeductibleMet)
    const oonCoinsurancePct = v.oon_coinsurance_pct ?? 40

    // Allowed amount is typically less than billed charge for OON
    // Use estimated_allowed_amount if available, otherwise estimate at 70% of billed
    const allowedAmount = v.estimated_allowed_amount ?? Math.round(serviceCostCents * 0.7)

    // Apply deductible first
    const deductibleApplied = Math.min(oonDeductibleRemaining, allowedAmount)
    const amountAfterDeductible = Math.max(0, allowedAmount - deductibleApplied)

    // Insurance pays their coinsurance portion of amount after deductible
    // OON coinsurance_pct represents what the PATIENT pays (e.g., 40% means patient pays 40%)
    const insurancePays = Math.round(amountAfterDeductible * ((100 - oonCoinsurancePct) / 100))
    const patientResponsibility = serviceCostCents - insurancePays

    return {
      success: true,
      data: {
        service_cost: serviceCostCents,
        allowed_amount: allowedAmount,
        deductible_remaining: oonDeductibleRemaining,
        deductible_applied: deductibleApplied,
        amount_after_deductible: amountAfterDeductible,
        coinsurance_pct: oonCoinsurancePct,
        insurance_pays: insurancePays,
        patient_responsibility: Math.max(0, patientResponsibility),
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while calculating reimbursement estimate.',
    }
  }
}

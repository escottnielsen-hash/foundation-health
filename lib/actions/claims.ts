'use server'

import { createClient } from '@/lib/supabase/server'
import { claimFilterSchema, claimNoteSchema, claimIdSchema } from '@/lib/validations/claims'
import type { ClaimStatus, ClaimWithDetails, ClaimLineItem, ClaimActivity, ClaimActivityType } from '@/types/database'
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
// Claims Summary type
// ============================================

export interface ClaimsSummary {
  totalBilled: number
  totalPaid: number
  pendingAmount: number
  denialRate: number
  totalClaims: number
  pendingClaims: number
  deniedClaims: number
  paidClaims: number
}

// ============================================
// Claim filter types
// ============================================

interface ClaimFilters {
  status?: string
  payer?: string
  date_from?: string
  date_to?: string
  sort_by?: string
  sort_order?: string
}

// ============================================
// Helper: get patient_profile ID from user ID
// ============================================

async function getPatientProfileId(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  return data?.id ?? null
}

// ============================================
// getPatientClaims
// ============================================

export async function getPatientClaims(
  userId: string,
  filters?: ClaimFilters
): Promise<ActionResult<ClaimWithDetails[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = claimFilterSchema.safeParse(filters)
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
    const patientProfileId = await getPatientProfileId(userId)

    if (!patientProfileId) {
      return { success: true, data: [] }
    }

    // Build query
    let query = supabase
      .from('insurance_claims')
      .select(`
        id,
        claim_number,
        patient_id,
        encounter_id,
        payer_id,
        policy_number,
        group_number,
        member_id,
        status,
        service_date,
        place_of_service,
        referring_provider,
        rendering_provider,
        billed_amount,
        qpa_amount,
        billed_multiplier,
        allowed_amount,
        paid_amount,
        patient_responsibility,
        denial_reason,
        appeal_deadline,
        idr_eligible,
        submitted_at,
        eob_received_at,
        eob_url,
        notes,
        created_at,
        updated_at,
        insurance_payers ( name )
      `)
      .eq('patient_id', patientProfileId)

    // Apply status filter
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // Apply payer filter (search by payer name from the join)
    // We filter payer client-side since it comes from a joined table

    // Apply date range filters
    if (filters?.date_from) {
      query = query.gte('service_date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('service_date', filters.date_to)
    }

    // Apply sorting
    const sortColumn = filters?.sort_by ? filters.sort_by : 'service_date'
    const sortAscending = filters?.sort_order === 'asc'
    query = query.order(sortColumn, { ascending: sortAscending, nullsFirst: false })

    const { data: claims, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load claims. Please try again.',
      }
    }

    // Map to ClaimWithDetails
    let result: ClaimWithDetails[] = (claims ?? []).map((claim) => {
      const rec = claim as Record<string, unknown>
      const payer = rec.insurance_payers as { name: string } | null
      return {
        id: claim.id,
        patient_id: claim.patient_id,
        encounter_id: claim.encounter_id ?? null,
        claim_number: claim.claim_number ?? null,
        payer_name: payer?.name ?? null,
        payer_id: claim.payer_id ?? null,
        member_id: (claim as Record<string, unknown>).member_id as string | null ?? null,
        group_number: claim.group_number ?? null,
        claim_status: claim.status as ClaimStatus,
        service_date: claim.service_date ?? null,
        place_of_service: (claim as Record<string, unknown>).place_of_service as string | null ?? null,
        referring_provider: (claim as Record<string, unknown>).referring_provider as string | null ?? null,
        rendering_provider: (claim as Record<string, unknown>).rendering_provider as string | null ?? null,
        billed_amount: Number(claim.billed_amount),
        qpa_amount: (claim as Record<string, unknown>).qpa_amount != null ? Number((claim as Record<string, unknown>).qpa_amount) : null,
        billed_multiplier: (claim as Record<string, unknown>).billed_multiplier != null ? Number((claim as Record<string, unknown>).billed_multiplier) : null,
        allowed_amount: claim.allowed_amount != null ? Number(claim.allowed_amount) : null,
        paid_amount: claim.paid_amount != null ? Number(claim.paid_amount) : null,
        patient_responsibility: claim.patient_responsibility != null ? Number(claim.patient_responsibility) : null,
        denial_reason: claim.denial_reason ?? null,
        appeal_deadline: claim.appeal_deadline ?? null,
        idr_eligible: (claim as Record<string, unknown>).idr_eligible as boolean ?? false,
        submitted_at: claim.submitted_at ?? null,
        eob_received_at: (claim as Record<string, unknown>).eob_received_at as string | null ?? null,
        eob_url: (claim as Record<string, unknown>).eob_url as string | null ?? null,
        notes: claim.notes ?? null,
        created_at: claim.created_at,
        updated_at: claim.updated_at,
      }
    })

    // Apply payer name filter client-side
    if (filters?.payer && filters.payer !== '') {
      const payerSearch = filters.payer.toLowerCase()
      result = result.filter((c) =>
        c.payer_name?.toLowerCase().includes(payerSearch)
      )
    }

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading claims.',
    }
  }
}

// ============================================
// getClaimDetail
// ============================================

export async function getClaimDetail(
  claimId: string,
  userId: string
): Promise<ActionResult<ClaimWithDetails>> {
  try {
    // Validate claim ID
    const idResult = claimIdSchema.safeParse({ id: claimId })
    if (!idResult.success) {
      return {
        success: false,
        error: 'Invalid claim ID.',
      }
    }

    const supabase = await createClient()
    const patientProfileId = await getPatientProfileId(userId)

    if (!patientProfileId) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    // Get the claim with payer info
    const { data: claim, error } = await supabase
      .from('insurance_claims')
      .select(`
        *,
        insurance_payers ( name )
      `)
      .eq('id', claimId)
      .eq('patient_id', patientProfileId)
      .single()

    if (error || !claim) {
      return {
        success: false,
        error: 'Claim not found or you do not have access.',
      }
    }

    // Get line items
    const { data: lineItems } = await supabase
      .from('claim_line_items')
      .select('*')
      .eq('claim_id', claimId)
      .order('line_number', { ascending: true })

    // Get activity log
    const { data: activities } = await supabase
      .from('claim_activities')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false })

    const rec = claim as Record<string, unknown>
    const payer = rec.insurance_payers as { name: string } | null

    const mappedLineItems: ClaimLineItem[] = (lineItems ?? []).map((item) => ({
      id: item.id,
      claim_id: item.claim_id,
      line_number: item.line_number,
      cpt_code: item.cpt_code,
      cpt_description: item.cpt_description ?? null,
      icd10_codes: item.icd10_codes ?? null,
      modifier: item.modifier ?? null,
      units: item.units,
      charge_amount: Number(item.charge_amount),
      qpa_amount: item.qpa_amount != null ? Number(item.qpa_amount) : null,
      allowed_amount: item.allowed_amount != null ? Number(item.allowed_amount) : null,
      paid_amount: item.paid_amount != null ? Number(item.paid_amount) : null,
      denial_reason_code: item.denial_reason_code ?? null,
      created_at: item.created_at,
    }))

    const mappedActivities: ClaimActivity[] = (activities ?? []).map((act) => ({
      id: act.id,
      claim_id: act.claim_id,
      activity_type: act.activity_type as ClaimActivityType,
      description: act.description,
      performed_by: act.performed_by ?? null,
      metadata: act.metadata as Record<string, unknown> | null ?? null,
      created_at: act.created_at,
    }))

    const result: ClaimWithDetails = {
      id: claim.id,
      patient_id: claim.patient_id,
      encounter_id: claim.encounter_id ?? null,
      claim_number: claim.claim_number ?? null,
      payer_name: payer?.name ?? null,
      payer_id: claim.payer_id ?? null,
      member_id: rec.member_id as string | null ?? null,
      group_number: claim.group_number ?? null,
      claim_status: claim.status as ClaimStatus,
      service_date: claim.service_date ?? null,
      place_of_service: rec.place_of_service as string | null ?? null,
      referring_provider: rec.referring_provider as string | null ?? null,
      rendering_provider: rec.rendering_provider as string | null ?? null,
      billed_amount: Number(claim.billed_amount),
      qpa_amount: rec.qpa_amount != null ? Number(rec.qpa_amount) : null,
      billed_multiplier: rec.billed_multiplier != null ? Number(rec.billed_multiplier) : null,
      allowed_amount: claim.allowed_amount != null ? Number(claim.allowed_amount) : null,
      paid_amount: claim.paid_amount != null ? Number(claim.paid_amount) : null,
      patient_responsibility: claim.patient_responsibility != null ? Number(claim.patient_responsibility) : null,
      denial_reason: claim.denial_reason ?? null,
      appeal_deadline: claim.appeal_deadline ?? null,
      idr_eligible: rec.idr_eligible as boolean ?? false,
      submitted_at: claim.submitted_at ?? null,
      eob_received_at: rec.eob_received_at as string | null ?? null,
      eob_url: rec.eob_url as string | null ?? null,
      notes: claim.notes ?? null,
      created_at: claim.created_at,
      updated_at: claim.updated_at,
      line_items: mappedLineItems,
      activities: mappedActivities,
    }

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the claim.',
    }
  }
}

// ============================================
// getClaimsSummary
// ============================================

export async function getClaimsSummary(
  userId: string
): Promise<ActionResult<ClaimsSummary>> {
  try {
    const supabase = await createClient()
    const patientProfileId = await getPatientProfileId(userId)

    if (!patientProfileId) {
      return {
        success: true,
        data: {
          totalBilled: 0,
          totalPaid: 0,
          pendingAmount: 0,
          denialRate: 0,
          totalClaims: 0,
          pendingClaims: 0,
          deniedClaims: 0,
          paidClaims: 0,
        },
      }
    }

    // Get all claims for this patient
    const { data: claims, error } = await supabase
      .from('insurance_claims')
      .select('status, billed_amount, paid_amount')
      .eq('patient_id', patientProfileId)

    if (error) {
      return {
        success: false,
        error: 'Could not load claims summary.',
      }
    }

    const allClaims = claims ?? []
    const totalClaims = allClaims.length

    const totalBilled = allClaims.reduce(
      (sum, c) => sum + Number(c.billed_amount),
      0
    )

    const totalPaid = allClaims.reduce(
      (sum, c) => sum + (c.paid_amount != null ? Number(c.paid_amount) : 0),
      0
    )

    const pendingStatuses = ['submitted', 'acknowledged', 'pending', 'in_review', 'appealed', 'idr_initiated']
    const pendingClaims = allClaims.filter((c) => pendingStatuses.includes(c.status))
    const pendingAmount = pendingClaims.reduce(
      (sum, c) => sum + Number(c.billed_amount),
      0
    )

    const deniedClaims = allClaims.filter((c) => c.status === 'denied')
    const paidClaims = allClaims.filter((c) =>
      c.status === 'paid' || c.status === 'partially_paid'
    )

    // Denial rate = denied / (denied + paid + partially_paid) -- only claims with final resolution
    const resolvedClaims = deniedClaims.length + paidClaims.length
    const denialRate = resolvedClaims > 0
      ? (deniedClaims.length / resolvedClaims) * 100
      : 0

    return {
      success: true,
      data: {
        totalBilled,
        totalPaid,
        pendingAmount,
        denialRate: Math.round(denialRate * 10) / 10,
        totalClaims,
        pendingClaims: pendingClaims.length,
        deniedClaims: deniedClaims.length,
        paidClaims: paidClaims.length,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading claims summary.',
    }
  }
}

// ============================================
// addClaimNote
// ============================================

export async function addClaimNote(
  claimId: string,
  note: string
): Promise<ActionResult<ClaimActivity>> {
  try {
    // Validate inputs
    const validationResult = claimNoteSchema.safeParse({ claim_id: claimId, note })
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (validationResult.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return {
        success: false,
        error: 'Invalid note data.',
        fieldErrors,
      }
    }

    const supabase = await createClient()

    // Get current user from session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to add a note.',
      }
    }

    const patientProfileId = await getPatientProfileId(user.id)

    if (!patientProfileId) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    // Verify the claim belongs to this patient
    const { data: claim, error: claimError } = await supabase
      .from('insurance_claims')
      .select('id')
      .eq('id', claimId)
      .eq('patient_id', patientProfileId)
      .single()

    if (claimError || !claim) {
      return {
        success: false,
        error: 'Claim not found or you do not have access.',
      }
    }

    // Insert the activity
    const { data: activity, error: insertError } = await supabase
      .from('claim_activities')
      .insert({
        claim_id: claimId,
        activity_type: 'note_added',
        description: note,
        performed_by: user?.id ?? null,
        metadata: null,
      })
      .select()
      .single()

    if (insertError || !activity) {
      return {
        success: false,
        error: 'Could not add note. Please try again.',
      }
    }

    return {
      success: true,
      data: {
        id: activity.id,
        claim_id: activity.claim_id,
        activity_type: activity.activity_type as ClaimActivityType,
        description: activity.description,
        performed_by: activity.performed_by ?? null,
        metadata: activity.metadata as Record<string, unknown> | null ?? null,
        created_at: activity.created_at,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while adding the note.',
    }
  }
}

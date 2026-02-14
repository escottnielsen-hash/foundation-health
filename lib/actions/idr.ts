'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  ClaimStatus,
  AppealStatus,
  AppealType,
  IdrCaseStatus,
} from '@/types/database'

// ============================================
// Types
// ============================================

export interface ClaimAppealRow {
  id: string
  claim_id: string
  appeal_level: number
  appeal_type: AppealType
  status: AppealStatus
  submitted_at: string | null
  deadline: string | null
  reason: string
  supporting_documents: string[] | null
  resolved_at: string | null
  resolution_amount: number | null
  resolution_notes: string | null
  created_at: string
  updated_at: string
}

export interface IdrCaseRow {
  id: string
  case_number: string | null
  claim_id: string
  patient_id: string
  payer_id: string
  practice_id: string
  status: string
  disputed_amount: number
  provider_proposed_amount: number | null
  payer_proposed_amount: number | null
  final_determined_amount: number | null
  qualifying_payment_amount: number | null
  open_negotiation_start: string | null
  open_negotiation_end: string | null
  idr_entity: string | null
  idr_submission_date: string | null
  idr_decision_date: string | null
  prevailing_party: string | null
  supporting_documents: unknown
  timeline: unknown
  notes: string | null
  case_reference: string | null
  provider_offer_amount: number | null
  payer_offer_amount: number | null
  entity_selected_at: string | null
  offers_due_date: string | null
  decision_due_date: string | null
  decided_at: string | null
  decision_amount: number | null
  decision_rationale: string | null
  qpa_amount: number | null
  provider_billed_amount: number | null
  idr_fee_amount: number | null
  idr_fee_paid_by: string | null
  created_at: string
  updated_at: string
}

export interface IdrCaseWithClaim extends IdrCaseRow {
  claim_number: string | null
  payer_name: string | null
  billed_amount: number
  service_date: string | null
  patient_name: string | null
}

export interface ClaimSummaryRow {
  id: string
  claim_number: string | null
  status: ClaimStatus
  billed_amount: number
  allowed_amount: number | null
  paid_amount: number | null
  service_date: string
  denial_reason: string | null
  appeal_deadline: string | null
  payer_name: string | null
  patient_name: string | null
  submitted_at: string | null
  created_at: string
}

export interface ClaimsSummaryStats {
  total: number
  pending: number
  denied: number
  inAppeal: number
  inIdr: number
  paid: number
  totalBilled: number
  totalPaid: number
  totalDenied: number
}

export interface IdrDashboardStats {
  activeCases: number
  totalCases: number
  winRate: number
  averageDecisionVsQpa: number
  totalRecovered: number
  pendingDecisions: number
  casesApproachingDeadline: number
}

export interface AppealPipelineItem {
  id: string
  claim_id: string
  claim_number: string | null
  payer_name: string | null
  billed_amount: number
  stage: 'denied' | 'appeal_1' | 'appeal_2' | 'external_review' | 'idr' | 'resolved'
  stage_status: string
  deadline: string | null
  amount_at_stake: number
  created_at: string
}

export interface IdrFilters {
  status?: string
  date_from?: string
  date_to?: string
}

export interface ClaimsFilters {
  status?: string
  date_from?: string
  date_to?: string
  search?: string
}

// ============================================
// getClaimAppeals
// ============================================

export async function getClaimAppeals(
  claimId: string
): Promise<{ success: true; data: ClaimAppealRow[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('claim_appeals')
      .select('*')
      .eq('claim_id', claimId)
      .order('appeal_level', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    const appeals: ClaimAppealRow[] = (data ?? []).map((row) => ({
      id: row.id,
      claim_id: row.claim_id,
      appeal_level: row.appeal_level,
      appeal_type: row.appeal_type as AppealType,
      status: row.status as AppealStatus,
      submitted_at: row.submitted_at ?? null,
      deadline: row.deadline ?? null,
      reason: row.reason,
      supporting_documents: row.supporting_documents ?? null,
      resolved_at: row.resolved_at ?? null,
      resolution_amount: row.resolution_amount ?? null,
      resolution_notes: row.resolution_notes ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return { success: true, data: appeals }
  } catch {
    return { success: false, error: 'Failed to fetch claim appeals' }
  }
}

// ============================================
// getIdrCases
// ============================================

export async function getIdrCases(
  filters?: IdrFilters
): Promise<{ success: true; data: IdrCaseWithClaim[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('idr_cases')
      .select(`
        *,
        insurance_claims!inner (
          claim_number,
          billed_amount,
          service_date,
          insurance_payers ( name )
        )
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }

    if (filters?.date_to) {
      const endDate = new Date(filters.date_to)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    const cases: IdrCaseWithClaim[] = (data ?? []).map((row) => {
      const claim = row.insurance_claims as unknown as {
        claim_number: string | null
        billed_amount: number
        service_date: string | null
        insurance_payers: { name: string } | null
      }

      return {
        ...row,
        claim_number: claim?.claim_number ?? null,
        payer_name: claim?.insurance_payers?.name ?? null,
        billed_amount: Number(claim?.billed_amount ?? 0),
        service_date: claim?.service_date ?? null,
        patient_name: null,
        status: row.status,
        disputed_amount: Number(row.disputed_amount ?? 0),
        provider_proposed_amount: row.provider_proposed_amount ? Number(row.provider_proposed_amount) : null,
        payer_proposed_amount: row.payer_proposed_amount ? Number(row.payer_proposed_amount) : null,
        final_determined_amount: row.final_determined_amount ? Number(row.final_determined_amount) : null,
        qualifying_payment_amount: row.qualifying_payment_amount ? Number(row.qualifying_payment_amount) : null,
        provider_offer_amount: row.provider_offer_amount ? Number(row.provider_offer_amount) : null,
        payer_offer_amount: row.payer_offer_amount ? Number(row.payer_offer_amount) : null,
        decision_amount: row.decision_amount ? Number(row.decision_amount) : null,
        qpa_amount: row.qpa_amount ? Number(row.qpa_amount) : null,
        provider_billed_amount: row.provider_billed_amount ? Number(row.provider_billed_amount) : null,
        idr_fee_amount: row.idr_fee_amount ? Number(row.idr_fee_amount) : null,
        idr_fee_paid_by: row.idr_fee_paid_by ?? null,
        case_reference: row.case_reference ?? null,
        entity_selected_at: row.entity_selected_at ?? null,
        offers_due_date: row.offers_due_date ?? null,
        decision_due_date: row.decision_due_date ?? null,
        decided_at: row.decided_at ?? null,
        decision_rationale: row.decision_rationale ?? null,
      }
    })

    return { success: true, data: cases }
  } catch {
    return { success: false, error: 'Failed to fetch IDR cases' }
  }
}

// ============================================
// getIdrCaseDetail
// ============================================

export async function getIdrCaseDetail(
  idrId: string
): Promise<{ success: true; data: IdrCaseWithClaim } | { success: false; error: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('idr_cases')
      .select(`
        *,
        insurance_claims!inner (
          claim_number,
          billed_amount,
          service_date,
          status,
          denial_reason,
          diagnosis_codes,
          procedure_codes,
          insurance_payers ( name )
        )
      `)
      .eq('id', idrId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'IDR case not found' }
    }

    const claim = data.insurance_claims as unknown as {
      claim_number: string | null
      billed_amount: number
      service_date: string | null
      status: string
      denial_reason: string | null
      diagnosis_codes: string[] | null
      procedure_codes: string[] | null
      insurance_payers: { name: string } | null
    }

    const idrCase: IdrCaseWithClaim = {
      ...data,
      claim_number: claim?.claim_number ?? null,
      payer_name: claim?.insurance_payers?.name ?? null,
      billed_amount: Number(claim?.billed_amount ?? 0),
      service_date: claim?.service_date ?? null,
      patient_name: null,
      status: data.status,
      disputed_amount: Number(data.disputed_amount ?? 0),
      provider_proposed_amount: data.provider_proposed_amount ? Number(data.provider_proposed_amount) : null,
      payer_proposed_amount: data.payer_proposed_amount ? Number(data.payer_proposed_amount) : null,
      final_determined_amount: data.final_determined_amount ? Number(data.final_determined_amount) : null,
      qualifying_payment_amount: data.qualifying_payment_amount ? Number(data.qualifying_payment_amount) : null,
      provider_offer_amount: data.provider_offer_amount ? Number(data.provider_offer_amount) : null,
      payer_offer_amount: data.payer_offer_amount ? Number(data.payer_offer_amount) : null,
      decision_amount: data.decision_amount ? Number(data.decision_amount) : null,
      qpa_amount: data.qpa_amount ? Number(data.qpa_amount) : null,
      provider_billed_amount: data.provider_billed_amount ? Number(data.provider_billed_amount) : null,
      idr_fee_amount: data.idr_fee_amount ? Number(data.idr_fee_amount) : null,
      idr_fee_paid_by: data.idr_fee_paid_by ?? null,
      case_reference: data.case_reference ?? null,
      entity_selected_at: data.entity_selected_at ?? null,
      offers_due_date: data.offers_due_date ?? null,
      decision_due_date: data.decision_due_date ?? null,
      decided_at: data.decided_at ?? null,
      decision_rationale: data.decision_rationale ?? null,
    }

    return { success: true, data: idrCase }
  } catch {
    return { success: false, error: 'Failed to fetch IDR case detail' }
  }
}

// ============================================
// getIdrDashboardStats
// ============================================

export async function getIdrDashboardStats(): Promise<IdrDashboardStats> {
  const supabase = await createClient()

  const defaultStats: IdrDashboardStats = {
    activeCases: 0,
    totalCases: 0,
    winRate: 0,
    averageDecisionVsQpa: 0,
    totalRecovered: 0,
    pendingDecisions: 0,
    casesApproachingDeadline: 0,
  }

  const { data: allCases } = await supabase
    .from('idr_cases')
    .select('id, status, decision_amount, qpa_amount, provider_offer_amount, payer_offer_amount, provider_billed_amount, decision_due_date, offers_due_date, decided_at')

  if (!allCases || allCases.length === 0) return defaultStats

  const totalCases = allCases.length

  const activeStatuses = ['initiated', 'entity_selected', 'offer_submitted', 'counter_submitted', 'under_review', 'negotiation', 'submitted', 'hearing_scheduled']
  const activeCases = allCases.filter((c) => activeStatuses.includes(c.status)).length

  const decidedCases = allCases.filter(
    (c) => c.status === 'decided_provider' || c.status === 'decided_payer' || c.status === 'decided' || c.status === 'settled'
  )
  const providerWins = allCases.filter(
    (c) => c.status === 'decided_provider' || c.status === 'settled'
  ).length
  const winRate = decidedCases.length > 0 ? (providerWins / decidedCases.length) * 100 : 0

  let totalDecisionAmount = 0
  let totalQpa = 0
  let decisionCount = 0
  let totalRecovered = 0

  for (const c of decidedCases) {
    const decisionAmt = Number(c.decision_amount ?? 0)
    const qpaAmt = Number(c.qpa_amount ?? 0)

    if (decisionAmt > 0 && qpaAmt > 0) {
      totalDecisionAmount += decisionAmt
      totalQpa += qpaAmt
      decisionCount++
    }

    if (decisionAmt > 0) {
      totalRecovered += decisionAmt
    }
  }

  const averageDecisionVsQpa = decisionCount > 0
    ? (totalDecisionAmount / totalQpa) * 100
    : 0

  const pendingDecisions = allCases.filter(
    (c) => c.status === 'under_review' || c.status === 'hearing_scheduled'
  ).length

  const now = new Date()
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(now.getDate() + 7)

  const casesApproachingDeadline = allCases.filter((c) => {
    const deadline = c.decision_due_date ?? c.offers_due_date
    if (!deadline) return false
    const deadlineDate = new Date(deadline)
    return deadlineDate >= now && deadlineDate <= sevenDaysFromNow && activeStatuses.includes(c.status)
  }).length

  return {
    activeCases,
    totalCases,
    winRate: Math.round(winRate * 10) / 10,
    averageDecisionVsQpa: Math.round(averageDecisionVsQpa),
    totalRecovered,
    pendingDecisions,
    casesApproachingDeadline,
  }
}

// ============================================
// getAppealPipeline
// ============================================

export async function getAppealPipeline(): Promise<AppealPipelineItem[]> {
  const supabase = await createClient()

  const pipeline: AppealPipelineItem[] = []

  // Get denied claims without appeals
  const { data: deniedClaims } = await supabase
    .from('insurance_claims')
    .select(`
      id,
      claim_number,
      billed_amount,
      status,
      appeal_deadline,
      created_at,
      insurance_payers ( name )
    `)
    .eq('status', 'denied')
    .order('created_at', { ascending: false })

  for (const claim of deniedClaims ?? []) {
    const payer = claim.insurance_payers as unknown as { name: string } | null

    // Check if this claim has any appeals
    const { data: appeals } = await supabase
      .from('claim_appeals')
      .select('id')
      .eq('claim_id', claim.id)
      .limit(1)

    if (!appeals || appeals.length === 0) {
      pipeline.push({
        id: claim.id,
        claim_id: claim.id,
        claim_number: claim.claim_number ?? null,
        payer_name: payer?.name ?? null,
        billed_amount: Number(claim.billed_amount),
        stage: 'denied',
        stage_status: 'Denied - No Appeal Filed',
        deadline: claim.appeal_deadline ?? null,
        amount_at_stake: Number(claim.billed_amount),
        created_at: claim.created_at,
      })
    }
  }

  // Get claims in appeal
  const { data: appealsData } = await supabase
    .from('claim_appeals')
    .select(`
      id,
      claim_id,
      appeal_type,
      status,
      deadline,
      created_at,
      insurance_claims!inner (
        claim_number,
        billed_amount,
        insurance_payers ( name )
      )
    `)
    .in('status', ['draft', 'submitted', 'in_review'])
    .order('created_at', { ascending: false })

  for (const appeal of appealsData ?? []) {
    const claim = appeal.insurance_claims as unknown as {
      claim_number: string | null
      billed_amount: number
      insurance_payers: { name: string } | null
    }

    let stage: AppealPipelineItem['stage'] = 'appeal_1'
    if (appeal.appeal_type === 'internal_second') stage = 'appeal_2'
    if (appeal.appeal_type === 'external' || appeal.appeal_type === 'state_review') stage = 'external_review'

    pipeline.push({
      id: appeal.id,
      claim_id: appeal.claim_id,
      claim_number: claim?.claim_number ?? null,
      payer_name: claim?.insurance_payers?.name ?? null,
      billed_amount: Number(claim?.billed_amount ?? 0),
      stage,
      stage_status: appeal.status,
      deadline: appeal.deadline ?? null,
      amount_at_stake: Number(claim?.billed_amount ?? 0),
      created_at: appeal.created_at,
    })
  }

  // Get active IDR cases
  const { data: idrCases } = await supabase
    .from('idr_cases')
    .select(`
      id,
      claim_id,
      status,
      disputed_amount,
      provider_billed_amount,
      decision_due_date,
      offers_due_date,
      created_at,
      insurance_claims!inner (
        claim_number,
        billed_amount,
        insurance_payers ( name )
      )
    `)
    .not('status', 'in', '("decided_provider","decided_payer","settled","withdrawn","administratively_closed","decided","closed")')
    .order('created_at', { ascending: false })

  for (const idr of idrCases ?? []) {
    const claim = idr.insurance_claims as unknown as {
      claim_number: string | null
      billed_amount: number
      insurance_payers: { name: string } | null
    }

    pipeline.push({
      id: idr.id,
      claim_id: idr.claim_id,
      claim_number: claim?.claim_number ?? null,
      payer_name: claim?.insurance_payers?.name ?? null,
      billed_amount: Number(claim?.billed_amount ?? 0),
      stage: 'idr',
      stage_status: idr.status,
      deadline: idr.decision_due_date ?? idr.offers_due_date ?? null,
      amount_at_stake: Number(idr.disputed_amount ?? idr.provider_billed_amount ?? claim?.billed_amount ?? 0),
      created_at: idr.created_at,
    })
  }

  return pipeline
}

// ============================================
// getAdminClaimsList
// ============================================

export async function getAdminClaimsList(
  filters?: ClaimsFilters
): Promise<{ success: true; data: ClaimSummaryRow[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('insurance_claims')
      .select(`
        id,
        claim_number,
        status,
        billed_amount,
        allowed_amount,
        paid_amount,
        service_date,
        denial_reason,
        appeal_deadline,
        submitted_at,
        created_at,
        insurance_payers ( name )
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.date_from) {
      query = query.gte('service_date', filters.date_from)
    }

    if (filters?.date_to) {
      query = query.lte('service_date', filters.date_to)
    }

    if (filters?.search) {
      query = query.or(`claim_number.ilike.%${filters.search}%,denial_reason.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    const claims: ClaimSummaryRow[] = (data ?? []).map((row) => {
      const payer = row.insurance_payers as unknown as { name: string } | null
      return {
        id: row.id,
        claim_number: row.claim_number ?? null,
        status: row.status as ClaimStatus,
        billed_amount: Number(row.billed_amount),
        allowed_amount: row.allowed_amount ? Number(row.allowed_amount) : null,
        paid_amount: row.paid_amount ? Number(row.paid_amount) : null,
        service_date: row.service_date,
        denial_reason: row.denial_reason ?? null,
        appeal_deadline: row.appeal_deadline ?? null,
        payer_name: payer?.name ?? null,
        patient_name: null,
        submitted_at: row.submitted_at ?? null,
        created_at: row.created_at,
      }
    })

    return { success: true, data: claims }
  } catch {
    return { success: false, error: 'Failed to fetch claims' }
  }
}

// ============================================
// getAdminClaimsSummary
// ============================================

export async function getAdminClaimsSummary(): Promise<ClaimsSummaryStats> {
  const supabase = await createClient()

  const defaultStats: ClaimsSummaryStats = {
    total: 0,
    pending: 0,
    denied: 0,
    inAppeal: 0,
    inIdr: 0,
    paid: 0,
    totalBilled: 0,
    totalPaid: 0,
    totalDenied: 0,
  }

  const { data: claims } = await supabase
    .from('insurance_claims')
    .select('id, status, billed_amount, paid_amount')

  if (!claims || claims.length === 0) return defaultStats

  const total = claims.length
  const pending = claims.filter((c) => c.status === 'pending' || c.status === 'submitted' || c.status === 'acknowledged').length
  const denied = claims.filter((c) => c.status === 'denied').length
  const inAppeal = claims.filter((c) => c.status === 'appealed').length
  const paid = claims.filter((c) => c.status === 'paid' || c.status === 'partially_paid').length
  const totalBilled = claims.reduce((sum, c) => sum + Number(c.billed_amount), 0)
  const totalPaid = claims.reduce((sum, c) => sum + Number(c.paid_amount ?? 0), 0)
  const totalDenied = claims
    .filter((c) => c.status === 'denied')
    .reduce((sum, c) => sum + Number(c.billed_amount), 0)

  // Count active IDR cases
  const { data: idrData } = await supabase
    .from('idr_cases')
    .select('id, status')

  const activeIdrStatuses = ['initiated', 'entity_selected', 'offer_submitted', 'counter_submitted', 'under_review', 'negotiation', 'submitted', 'hearing_scheduled']
  const inIdr = (idrData ?? []).filter((c) => activeIdrStatuses.includes(c.status)).length

  return {
    total,
    pending,
    denied,
    inAppeal,
    inIdr,
    paid,
    totalBilled,
    totalPaid,
    totalDenied,
  }
}

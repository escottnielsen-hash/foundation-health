'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  Invoice,
  InsuranceClaim,
  PaymentHistory,
  InvoiceStatus,
  ClaimStatus,
} from '@/types/database'

// ============================================
// Billing Types
// ============================================

export interface BillingSummary {
  outstandingBalance: number
  paidThisYear: number
  pendingReimbursements: number
  nextPaymentDue: string | null
}

export interface RecentInvoice {
  id: string
  invoice_number: string | null
  status: InvoiceStatus
  total: number
  amount_due: number
  amount_paid: number
  due_date: string | null
  issued_at: string | null
  created_at: string
}

export interface RecentSuperbill {
  id: string
  claim_number: string | null
  status: ClaimStatus
  billed_amount: number
  paid_amount: number | null
  service_date: string
  payer_name: string | null
  submitted_at: string | null
  created_at: string
}

export interface RecentPayment {
  id: string
  amount: number
  currency: string
  status: string
  payment_method_type: string | null
  payment_method_last4: string | null
  description: string | null
  receipt_url: string | null
  invoice_url: string | null
  paid_at: string | null
  created_at: string
}

export interface PaymentFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface PaymentHistorySummary {
  totalPaid: number
  failedCount: number
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
// getBillingSummary
// ============================================

export async function getBillingSummary(userId: string): Promise<BillingSummary> {
  const supabase = await createClient()
  const patientProfileId = await getPatientProfileId(userId)

  const defaultSummary: BillingSummary = {
    outstandingBalance: 0,
    paidThisYear: 0,
    pendingReimbursements: 0,
    nextPaymentDue: null,
  }

  if (!patientProfileId) return defaultSummary

  // Outstanding balance: sum of amount_due for unpaid invoices
  const { data: unpaidInvoices } = await supabase
    .from('invoices')
    .select('amount_due, due_date')
    .eq('patient_id', patientProfileId)
    .in('status', ['sent', 'partially_paid', 'overdue'])

  const outstandingBalance = (unpaidInvoices ?? []).reduce(
    (sum, inv) => sum + Number(inv.amount_due),
    0
  )

  // Next payment due: earliest due date among unpaid invoices
  const unpaidWithDueDate = (unpaidInvoices ?? [])
    .filter((inv) => inv.due_date)
    .sort((a, b) => {
      const dateA = new Date(a.due_date!).getTime()
      const dateB = new Date(b.due_date!).getTime()
      return dateA - dateB
    })

  const nextPaymentDue = unpaidWithDueDate.length > 0
    ? unpaidWithDueDate[0].due_date
    : null

  // Paid this year: sum of amount_paid for invoices paid in current year
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()
  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('amount_paid')
    .eq('patient_id', patientProfileId)
    .in('status', ['paid', 'partially_paid', 'refunded'])
    .gte('paid_at', yearStart)

  const paidThisYear = (paidInvoices ?? []).reduce(
    (sum, inv) => sum + Number(inv.amount_paid),
    0
  )

  // Pending reimbursements: superbills (insurance_claims) submitted but not yet paid
  const { data: pendingClaims } = await supabase
    .from('insurance_claims')
    .select('billed_amount')
    .eq('patient_id', patientProfileId)
    .in('status', ['submitted', 'acknowledged', 'pending', 'appealed'])

  const pendingReimbursements = (pendingClaims ?? []).reduce(
    (sum, claim) => sum + Number(claim.billed_amount),
    0
  )

  return {
    outstandingBalance,
    paidThisYear,
    pendingReimbursements,
    nextPaymentDue,
  }
}

// ============================================
// getRecentInvoices
// ============================================

export async function getRecentInvoices(
  userId: string,
  limit: number = 5
): Promise<RecentInvoice[]> {
  const supabase = await createClient()
  const patientProfileId = await getPatientProfileId(userId)

  if (!patientProfileId) return []

  const { data } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, amount_due, amount_paid, due_date, issued_at, created_at')
    .eq('patient_id', patientProfileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((inv) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    status: inv.status as InvoiceStatus,
    total: Number(inv.total),
    amount_due: Number(inv.amount_due),
    amount_paid: Number(inv.amount_paid),
    due_date: inv.due_date,
    issued_at: inv.issued_at,
    created_at: inv.created_at,
  }))
}

// ============================================
// getRecentSuperbills
// ============================================

export async function getRecentSuperbills(
  userId: string,
  limit: number = 5
): Promise<RecentSuperbill[]> {
  const supabase = await createClient()
  const patientProfileId = await getPatientProfileId(userId)

  if (!patientProfileId) return []

  const { data } = await supabase
    .from('insurance_claims')
    .select(`
      id,
      claim_number,
      status,
      billed_amount,
      paid_amount,
      service_date,
      submitted_at,
      created_at,
      insurance_payers ( name )
    `)
    .eq('patient_id', patientProfileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((claim) => {
    const payer = claim.insurance_payers as unknown as { name: string } | null
    return {
      id: claim.id,
      claim_number: claim.claim_number,
      status: claim.status as ClaimStatus,
      billed_amount: Number(claim.billed_amount),
      paid_amount: claim.paid_amount ? Number(claim.paid_amount) : null,
      service_date: claim.service_date,
      payer_name: payer?.name ?? null,
      submitted_at: claim.submitted_at,
      created_at: claim.created_at,
    }
  })
}

// ============================================
// getRecentPayments
// ============================================

export async function getRecentPayments(
  userId: string,
  limit: number = 5
): Promise<RecentPayment[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('payment_history')
    .select('id, amount, currency, status, payment_method_type, payment_method_last4, description, receipt_url, invoice_url, paid_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((payment) => ({
    id: payment.id,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    payment_method_type: payment.payment_method_type,
    payment_method_last4: payment.payment_method_last4,
    description: payment.description,
    receipt_url: payment.receipt_url,
    invoice_url: payment.invoice_url,
    paid_at: payment.paid_at,
    created_at: payment.created_at,
  }))
}

// ============================================
// getPaymentHistory
// ============================================

export async function getPaymentHistory(
  userId: string,
  filters?: PaymentFilters
): Promise<{ payments: RecentPayment[]; summary: PaymentHistorySummary }> {
  const supabase = await createClient()

  let query = supabase
    .from('payment_history')
    .select('id, amount, currency, status, payment_method_type, payment_method_last4, description, receipt_url, invoice_url, paid_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    // Add one day to include the end date fully
    const endDate = new Date(filters.dateTo)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lt('created_at', endDate.toISOString())
  }

  const { data } = await query

  const payments: RecentPayment[] = (data ?? []).map((payment) => ({
    id: payment.id,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    payment_method_type: payment.payment_method_type,
    payment_method_last4: payment.payment_method_last4,
    description: payment.description,
    receipt_url: payment.receipt_url,
    invoice_url: payment.invoice_url,
    paid_at: payment.paid_at,
    created_at: payment.created_at,
  }))

  const totalPaid = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0)

  const failedCount = payments.filter((p) => p.status === 'failed').length

  return {
    payments,
    summary: { totalPaid, failedCount },
  }
}

// ============================================
// createBillingPortalSession
// ============================================

export async function createBillingPortalSession(userId: string): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = await createClient()

    // Look up the Stripe customer ID from patient_memberships
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return { error: 'Patient profile not found' }
    }

    const { data: membership } = await supabase
      .from('patient_memberships')
      .select('stripe_customer_id')
      .eq('patient_id', patientProfile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!membership?.stripe_customer_id) {
      // Fallback: check subscriptions table
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!subscription?.stripe_customer_id) {
        return { error: 'No billing account found. Please contact support.' }
      }

      return {
        url: `/api/stripe/portal?customer=${subscription.stripe_customer_id}`,
      }
    }

    return {
      url: `/api/stripe/portal?customer=${membership.stripe_customer_id}`,
    }
  } catch {
    return { error: 'Failed to create billing portal session' }
  }
}

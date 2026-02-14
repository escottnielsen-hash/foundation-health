'use server'

import { createClient } from '@/lib/supabase/server'
import { invoiceFilterSchema, invoiceIdSchema } from '@/lib/validations/invoices'
import type { Invoice, InvoiceStatus } from '@/types/database'
import type { InvoiceLineItem } from '@/lib/validations/invoices'
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
// Extended invoice types
// ============================================

export interface InvoiceWithDetails extends Invoice {
  practice_name: string | null
  line_items_parsed: InvoiceLineItem[]
}

export interface InvoiceDetail extends InvoiceWithDetails {
  patient_name: string | null
  patient_email: string | null
  encounter_date: string | null
  payments: PaymentRecord[]
}

export interface PaymentRecord {
  id: string
  amount: number
  currency: string
  status: string
  payment_method_type: string | null
  payment_method_last4: string | null
  paid_at: string | null
  created_at: string
}

export interface InvoiceSummaryData {
  outstanding_balance: number
  total_paid_ytd: number
  last_payment_date: string | null
  overdue_count: number
}

// ============================================
// Invoice filter types
// ============================================

interface InvoiceFilters {
  status?: string
  date_from?: string
  date_to?: string
}

// ============================================
// getPatientInvoices
// ============================================

export async function getPatientInvoices(
  userId: string,
  filters?: InvoiceFilters
): Promise<ActionResult<InvoiceWithDetails[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = invoiceFilterSchema.safeParse(filters)
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

    // Get patient profile for this user
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return { success: true, data: [] }
    }

    // Build query with practice name join
    let query = supabase
      .from('invoices')
      .select(`
        *,
        practice:practices!invoices_practice_id_fkey(
          name
        )
      `)
      .eq('patient_id', patientProfile.id)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (filters?.status && filters.status !== '') {
      query = query.eq('status', filters.status)
    }

    // Apply date range filters (based on issued_at or created_at)
    if (filters?.date_from && filters.date_from !== '') {
      query = query.gte('created_at', `${filters.date_from}T00:00:00.000Z`)
    }
    if (filters?.date_to && filters.date_to !== '') {
      query = query.lte('created_at', `${filters.date_to}T23:59:59.999Z`)
    }

    const { data: invoices, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load invoices. Please try again.',
      }
    }

    // Flatten practice name and parse line items
    const result: InvoiceWithDetails[] = (invoices ?? []).map((invoice) => {
      const rec = invoice as Record<string, unknown>
      const practice = rec.practice as { name: string } | null

      const rawLineItems = rec.line_items as InvoiceLineItem[] | null
      const lineItemsParsed: InvoiceLineItem[] = Array.isArray(rawLineItems)
        ? rawLineItems
        : []

      const { practice: _removed, ...rest } = rec
      return {
        ...rest,
        practice_name: practice?.name ?? null,
        line_items_parsed: lineItemsParsed,
      } as InvoiceWithDetails
    })

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading invoices.',
    }
  }
}

// ============================================
// getInvoiceById
// ============================================

export async function getInvoiceById(
  invoiceId: string,
  userId: string
): Promise<ActionResult<InvoiceDetail>> {
  try {
    // Validate invoice ID
    const idResult = invoiceIdSchema.safeParse({ id: invoiceId })
    if (!idResult.success) {
      return {
        success: false,
        error: 'Invalid invoice ID.',
      }
    }

    const supabase = await createClient()

    // Get patient profile to verify ownership
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    // Fetch the invoice with practice and patient info
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        practice:practices!invoices_practice_id_fkey(
          name
        ),
        encounter:encounters!invoices_encounter_id_fkey(
          check_in_time
        )
      `)
      .eq('id', invoiceId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (error || !invoice) {
      return {
        success: false,
        error: 'Invoice not found or you do not have access.',
      }
    }

    // Get patient profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single()

    // Get payment history for this invoice
    const { data: payments } = await supabase
      .from('payment_history')
      .select('id, amount, currency, status, payment_method_type, payment_method_last4, paid_at, created_at')
      .eq('user_id', userId)
      .eq('stripe_invoice_id', invoice.stripe_invoice_id ?? '')
      .order('created_at', { ascending: false })

    // Also try matching by stripe_payment_intent_id
    let allPayments = payments ?? []
    if (invoice.stripe_payment_intent_id) {
      const { data: intentPayments } = await supabase
        .from('payment_history')
        .select('id, amount, currency, status, payment_method_type, payment_method_last4, paid_at, created_at')
        .eq('user_id', userId)
        .eq('stripe_payment_intent_id', invoice.stripe_payment_intent_id)
        .order('created_at', { ascending: false })

      if (intentPayments && intentPayments.length > 0) {
        const existingIds = new Set(allPayments.map((p) => p.id))
        for (const payment of intentPayments) {
          if (!existingIds.has(payment.id)) {
            allPayments.push(payment)
          }
        }
      }
    }

    const rec = invoice as Record<string, unknown>
    const practice = rec.practice as { name: string } | null
    const encounter = rec.encounter as { check_in_time: string | null } | null

    const rawLineItems = rec.line_items as InvoiceLineItem[] | null
    const lineItemsParsed: InvoiceLineItem[] = Array.isArray(rawLineItems)
      ? rawLineItems
      : []

    const patientName = profile
      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
      : null

    const { practice: _practice, encounter: _encounter, ...rest } = rec

    return {
      success: true,
      data: {
        ...rest,
        practice_name: practice?.name ?? null,
        line_items_parsed: lineItemsParsed,
        patient_name: patientName || null,
        patient_email: profile?.email ?? null,
        encounter_date: encounter?.check_in_time ?? null,
        payments: allPayments as PaymentRecord[],
      } as InvoiceDetail,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the invoice.',
    }
  }
}

// ============================================
// getInvoiceSummary
// ============================================

export async function getInvoiceSummary(
  userId: string
): Promise<ActionResult<InvoiceSummaryData>> {
  try {
    const supabase = await createClient()

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: true,
        data: {
          outstanding_balance: 0,
          total_paid_ytd: 0,
          last_payment_date: null,
          overdue_count: 0,
        },
      }
    }

    // Get all invoices for the patient
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('status, amount_due, amount_paid, total, paid_at, created_at')
      .eq('patient_id', patientProfile.id)

    if (error) {
      return {
        success: false,
        error: 'Could not load invoice summary.',
      }
    }

    const allInvoices = invoices ?? []
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01T00:00:00.000Z`

    // Calculate outstanding balance (unpaid statuses)
    const outstandingStatuses: InvoiceStatus[] = ['sent', 'partially_paid', 'overdue']
    const outstanding = allInvoices
      .filter((inv) => outstandingStatuses.includes(inv.status as InvoiceStatus))
      .reduce((sum, inv) => sum + Number(inv.amount_due ?? 0), 0)

    // Calculate total paid this year
    const paidThisYear = allInvoices
      .filter((inv) => {
        const paidDate = inv.paid_at ?? inv.created_at
        return inv.status === 'paid' && paidDate >= startOfYear
      })
      .reduce((sum, inv) => sum + Number(inv.amount_paid ?? 0), 0)

    // Also include partial payments from partially_paid invoices this year
    const partialPaidThisYear = allInvoices
      .filter((inv) => {
        return inv.status === 'partially_paid' && inv.created_at >= startOfYear
      })
      .reduce((sum, inv) => sum + Number(inv.amount_paid ?? 0), 0)

    // Get last payment date
    const paidInvoices = allInvoices
      .filter((inv) => inv.paid_at)
      .sort((a, b) => {
        const dateA = a.paid_at ?? ''
        const dateB = b.paid_at ?? ''
        return dateB.localeCompare(dateA)
      })

    const lastPaymentDate = paidInvoices.length > 0
      ? paidInvoices[0].paid_at
      : null

    // Count overdue invoices
    const overdueCount = allInvoices.filter((inv) => inv.status === 'overdue').length

    return {
      success: true,
      data: {
        outstanding_balance: outstanding,
        total_paid_ytd: paidThisYear + partialPaidThisYear,
        last_payment_date: lastPaymentDate ?? null,
        overdue_count: overdueCount,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the invoice summary.',
    }
  }
}

// ============================================
// createPaymentSession
// ============================================

export async function createPaymentSession(
  invoiceId: string,
  userId: string
): Promise<ActionResult<{ checkout_url: string }>> {
  try {
    // Validate invoice ID
    const idResult = invoiceIdSchema.safeParse({ id: invoiceId })
    if (!idResult.success) {
      return { success: false, error: 'Invalid invoice ID.' }
    }

    const supabase = await createClient()

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return { success: false, error: 'Patient profile not found.' }
    }

    // Get the invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, amount_due, status, practice_id')
      .eq('id', invoiceId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (error || !invoice) {
      return {
        success: false,
        error: 'Invoice not found or you do not have access.',
      }
    }

    // Verify the invoice is payable
    const payableStatuses: InvoiceStatus[] = ['sent', 'partially_paid', 'overdue']
    if (!payableStatuses.includes(invoice.status as InvoiceStatus)) {
      return {
        success: false,
        error: 'This invoice is not eligible for payment.',
      }
    }

    if (Number(invoice.amount_due) <= 0) {
      return {
        success: false,
        error: 'No balance due on this invoice.',
      }
    }

    // Lazy-load Stripe
    const { getStripe } = await import('@/lib/stripe')
    const stripe = getStripe()

    // Create Stripe checkout session
    const amountInCents = Math.round(Number(invoice.amount_due) * 100)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice ${invoice.invoice_number ?? invoice.id}`,
              description: `Payment for Foundation Health invoice`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        patient_id: patientProfile.id,
        practice_id: invoice.practice_id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/patient/billing/invoices/${invoice.id}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/patient/billing/invoices/${invoice.id}?payment=cancelled`,
    })

    if (!session.url) {
      return {
        success: false,
        error: 'Could not create payment session. Please try again.',
      }
    }

    return {
      success: true,
      data: { checkout_url: session.url },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while creating the payment session.',
    }
  }
}

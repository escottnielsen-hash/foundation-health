'use server'

import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import type { InvoiceLineItem } from '@/lib/validations/invoices'

// ============================================
// Types
// ============================================

export interface CheckoutInvoice {
  id: string
  invoice_number: string | null
  status: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total: number
  amount_paid: number
  amount_due: number
  membership_tier_applied: string | null
  line_items: InvoiceLineItem[]
  notes: string | null
  due_date: string | null
  issued_at: string | null
  created_at: string
  practice_name: string | null
}

export interface VerifiedPayment {
  amount_total: number
  currency: string
  status: string
  invoice_id: string | null
  payment_date: string
}

// ============================================
// getCheckoutInvoice
// ============================================

export async function getCheckoutInvoice(
  invoiceId: string,
  userId: string
): Promise<{ data: CheckoutInvoice | null; error: string | null }> {
  try {
    const supabase = await createClient()

    // First get the patient_profile id for this user
    const { data: patientProfile, error: profileError } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profileError || !patientProfile) {
      return { data: null, error: 'Patient profile not found' }
    }

    // Fetch the invoice, ensuring it belongs to this patient
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        subtotal,
        discount_amount,
        tax_amount,
        total,
        amount_paid,
        amount_due,
        membership_tier_applied,
        line_items,
        notes,
        due_date,
        issued_at,
        created_at,
        practice_id,
        practices:practice_id (name)
      `)
      .eq('id', invoiceId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (invoiceError || !invoice) {
      return { data: null, error: 'Invoice not found or access denied' }
    }

    // Only allow checkout for invoices that are payable
    const payableStatuses = ['sent', 'partially_paid', 'overdue']
    if (!payableStatuses.includes(invoice.status)) {
      return {
        data: null,
        error: `This invoice cannot be paid (status: ${invoice.status})`,
      }
    }

    // Parse line items from JSONB
    const lineItems: InvoiceLineItem[] = Array.isArray(invoice.line_items)
      ? (invoice.line_items as unknown as InvoiceLineItem[])
      : []

    // Extract practice name from joined data
    const practiceData = invoice.practices as unknown as { name: string } | null

    return {
      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount,
        tax_amount: invoice.tax_amount,
        total: invoice.total,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        membership_tier_applied: invoice.membership_tier_applied,
        line_items: lineItems,
        notes: invoice.notes,
        due_date: invoice.due_date,
        issued_at: invoice.issued_at,
        created_at: invoice.created_at,
        practice_name: practiceData?.name ?? null,
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[getCheckoutInvoice] Error:', message)
    return { data: null, error: 'Failed to fetch invoice details' }
  }
}

// ============================================
// verifyPaymentSession
// ============================================

export async function verifyPaymentSession(
  sessionId: string
): Promise<{ data: VerifiedPayment | null; error: string | null }> {
  try {
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.status !== 'complete') {
      return {
        data: null,
        error: 'Payment session is not complete',
      }
    }

    const invoiceId = session.metadata?.invoice_id ?? null

    return {
      data: {
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? 'usd',
        status: session.status,
        invoice_id: invoiceId,
        payment_date: new Date(
          (session.created ?? 0) * 1000
        ).toISOString(),
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[verifyPaymentSession] Error:', message)
    return { data: null, error: 'Failed to verify payment session' }
  }
}

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import type { InvoiceLineItem } from '@/lib/validations/invoices'

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to make a payment' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        { error: firstIssue.message },
        { status: 400 }
      )
    }

    const { invoice_id } = parsed.data

    // Get the patient profile for this user
    const { data: patientProfile, error: profileError } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !patientProfile) {
      return NextResponse.json(
        { error: 'Patient profile not found' },
        { status: 404 }
      )
    }

    // Fetch invoice and verify ownership
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        total,
        amount_due,
        amount_paid,
        line_items,
        patient_id,
        practice_id
      `)
      .eq('id', invoice_id)
      .eq('patient_id', patientProfile.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or access denied' },
        { status: 404 }
      )
    }

    // Verify invoice is payable
    const payableStatuses = ['sent', 'partially_paid', 'overdue']
    if (!payableStatuses.includes(invoice.status)) {
      return NextResponse.json(
        { error: `This invoice cannot be paid (status: ${invoice.status})` },
        { status: 400 }
      )
    }

    if (invoice.amount_due <= 0) {
      return NextResponse.json(
        { error: 'No amount due on this invoice' },
        { status: 400 }
      )
    }

    // Parse line items
    const lineItems: InvoiceLineItem[] = Array.isArray(invoice.line_items)
      ? (invoice.line_items as unknown as InvoiceLineItem[])
      : []

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', user.id)
      .single()

    const email = profile?.email || user.email
    const stripe = getStripe()

    // Look up or create Stripe customer
    // First check patient_memberships for existing customer
    const { data: membership } = await supabase
      .from('patient_memberships')
      .select('stripe_customer_id')
      .eq('patient_id', patientProfile.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single()

    let customerId = membership?.stripe_customer_id ?? null

    // Also check subscriptions table
    if (!customerId) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .not('stripe_customer_id', 'is', null)
        .single()

      customerId = subscription?.stripe_customer_id ?? null
    }

    if (!customerId) {
      // Search Stripe for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: email ?? undefined,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: email ?? undefined,
          name:
            profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : undefined,
          metadata: {
            userId: user.id,
            patientId: patientProfile.id,
          },
        })
        customerId = customer.id
      }
    }

    // Build Stripe line items from invoice
    // If we have parsed line items, use them; otherwise create a single line item
    const stripeLineItems =
      lineItems.length > 0
        ? lineItems.map((item) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                description: item.cpt_code
                  ? `CPT: ${item.cpt_code}`
                  : undefined,
              },
              unit_amount: Math.round(item.unit_price * 100), // convert dollars to cents
            },
            quantity: item.qty,
          }))
        : [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Invoice ${invoice.invoice_number ?? invoice.id}`,
                  description: 'Medical services',
                },
                unit_amount: Math.round(invoice.amount_due * 100),
              },
              quantity: 1,
            },
          ]

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      success_url: `${siteUrl}/patient/billing/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/patient/billing/checkout/cancelled`,
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number ?? '',
        user_id: user.id,
        patient_id: patientProfile.id,
      },
      payment_intent_data: {
        metadata: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number ?? '',
          user_id: user.id,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[billing/checkout] Error:', message)
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 }
    )
  }
}

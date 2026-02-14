import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to access the billing portal' },
        { status: 401 }
      )
    }

    // Look up the user's Stripe customer ID from their subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 404 }
      )
    }

    // Create Stripe billing portal session
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/patient/membership`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe portal error:', message)
    return NextResponse.json(
      { error: `Failed to create portal session: ${message}` },
      { status: 500 }
    )
  }
}

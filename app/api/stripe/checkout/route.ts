import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      )
    }

    const { priceId, successUrl, cancelUrl } = await request.json()

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', user.id)
      .single()

    const email = profile?.email || user.email

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = existingSubscription?.stripe_customer_id

    if (!customerId) {
      // Search for existing Stripe customer by email
      const existingCustomers = await getStripe().customers.list({
        email: email ?? undefined,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
      } else {
        // Create new Stripe customer
        const customer = await getStripe().customers.create({
          email: email ?? undefined,
          name:
            profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : undefined,
          metadata: {
            userId: user.id,
          },
        })
        customerId = customer.id
      }
    }

    // Determine the tier from the price metadata (optional)
    const price = await getStripe().prices.retrieve(priceId)
    const tier = price.metadata?.tier ?? 'silver'

    // Create Stripe checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier,
        },
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe checkout error:', message)
    return NextResponse.json(
      { error: `Failed to create checkout session: ${message}` },
      { status: 500 }
    )
  }
}

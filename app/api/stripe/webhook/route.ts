import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role client for webhook DB writes (bypasses RLS)
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for service role client')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Stripe webhook: Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe webhook signature verification failed: ${message}`)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription' || !session.subscription) {
          break
        }

        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string
        )

        const userId = session.metadata?.userId
        if (!userId) {
          console.error('Stripe webhook: No userId in checkout session metadata')
          break
        }

        // Extract period from subscription items (Stripe SDK v20+ structure)
        const subItem = subscription.items.data[0]
        const periodStart = subItem?.current_period_start
        const periodEnd = subItem?.current_period_end

        // Upsert subscription record
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: session.customer as string,
              stripe_price_id: subItem?.price.id ?? null,
              tier: session.metadata?.tier ?? null,
              status: subscription.status,
              current_period_start: periodStart
                ? new Date(periodStart * 1000).toISOString()
                : null,
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (subError) {
          console.error('Stripe webhook: Error upserting subscription:', subError)
        } else {
          console.log(`Stripe webhook: Subscription created/updated for user ${userId}`)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const updatedItem = subscription.items.data[0]
        const updatedPeriodStart = updatedItem?.current_period_start
        const updatedPeriodEnd = updatedItem?.current_period_end

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_price_id: updatedItem?.price.id ?? null,
            current_period_start: updatedPeriodStart
              ? new Date(updatedPeriodStart * 1000).toISOString()
              : null,
            current_period_end: updatedPeriodEnd
              ? new Date(updatedPeriodEnd * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (updateError) {
          console.error('Stripe webhook: Error updating subscription:', updateError)
        } else {
          console.log(`Stripe webhook: Subscription ${subscription.id} updated to ${subscription.status}`)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error: deleteError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (deleteError) {
          console.error('Stripe webhook: Error cancelling subscription:', deleteError)
        } else {
          console.log(`Stripe webhook: Subscription ${subscription.id} cancelled`)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subDetails = invoice.parent?.subscription_details
        const subscriptionId = typeof subDetails?.subscription === 'string'
          ? subDetails.subscription
          : subDetails?.subscription?.id

        if (!subscriptionId) {
          break
        }

        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer?.id ?? '',
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            invoice_url: invoice.hosted_invoice_url,
            period_start: invoice.period_start
              ? new Date(invoice.period_start * 1000).toISOString()
              : null,
            period_end: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : null,
            created_at: new Date().toISOString(),
          })

        if (paymentError) {
          console.error('Stripe webhook: Error recording payment:', paymentError)
        } else {
          console.log(`Stripe webhook: Payment recorded for invoice ${invoice.id}`)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const failedSubDetails = invoice.parent?.subscription_details
        const failedSubscriptionId = typeof failedSubDetails?.subscription === 'string'
          ? failedSubDetails.subscription
          : failedSubDetails?.subscription?.id

        if (!failedSubscriptionId) {
          break
        }

        // Record the failed payment
        await supabase.from('payment_history').insert({
          stripe_invoice_id: invoice.id,
          stripe_subscription_id: failedSubscriptionId,
          stripe_customer_id: typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? '',
          amount_paid: 0,
          currency: invoice.currency,
          status: 'failed',
          invoice_url: invoice.hosted_invoice_url,
          period_start: invoice.period_start
            ? new Date(invoice.period_start * 1000).toISOString()
            : null,
          period_end: invoice.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : null,
          created_at: new Date().toISOString(),
        })

        // Update subscription status to past_due
        const { error: statusError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', failedSubscriptionId)

        if (statusError) {
          console.error('Stripe webhook: Error updating subscription status on payment failure:', statusError)
        } else {
          console.log(`Stripe webhook: Payment failed for invoice ${invoice.id}, subscription marked as past_due`)
        }

        break
      }

      default: {
        console.log(`Stripe webhook: Unhandled event type ${event.type}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe webhook handler error: ${message}`)
    return NextResponse.json(
      { error: `Webhook handler error: ${message}` },
      { status: 500 }
    )
  }
}

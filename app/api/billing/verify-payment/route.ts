import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { sessionSchema } from '@/lib/validations/checkout'

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to verify a payment' },
        { status: 401 }
      )
    }

    // Get session_id from query params
    const sessionId = request.nextUrl.searchParams.get('session_id')

    const parsed = sessionSchema.safeParse({ session_id: sessionId })

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return NextResponse.json(
        { error: firstIssue.message },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(
      parsed.data.session_id
    )

    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Payment session does not belong to this user' },
        { status: 403 }
      )
    }

    if (session.status !== 'complete') {
      return NextResponse.json(
        {
          error: 'Payment is not complete',
          status: session.status,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: session.status,
      invoice_id: session.metadata?.invoice_id ?? null,
      invoice_number: session.metadata?.invoice_number ?? null,
      payment_date: new Date(
        (session.created ?? 0) * 1000
      ).toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[billing/verify-payment] Error:', message)
    return NextResponse.json(
      { error: `Failed to verify payment: ${message}` },
      { status: 500 }
    )
  }
}

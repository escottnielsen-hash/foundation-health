import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Lazily initialised Stripe server-side client.
 * Calling this at module-load time is safe; it only throws when
 * STRIPE_SECRET_KEY is missing AND the function is actually invoked
 * (i.e. at request time, not at build / page-data-collection time).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. Add it to your .env.local file.'
      )
    }
    _stripe = new Stripe(key, { typescript: true })
  }
  return _stripe
}

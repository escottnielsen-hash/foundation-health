'use client'

import { useEffect, useState } from 'react'
import { useSubscriptionStore } from '@/lib/stores/subscription-store'
import {
  MEMBERSHIP_TIERS,
  type MembershipTierKey,
} from '@/lib/constants/membership'
import { Check, Crown, Shield, Star, Loader2, ExternalLink } from 'lucide-react'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const tierIcons: Record<MembershipTierKey, React.ReactNode> = {
  platinum: <Crown className="w-6 h-6" />,
  gold: <Star className="w-6 h-6" />,
  silver: <Shield className="w-6 h-6" />,
}

const tierOrder: MembershipTierKey[] = ['silver', 'gold', 'platinum']

export default function PatientMembershipPage() {
  const {
    currentTier,
    status,
    currentPeriodEnd,
    loading,
    fetchSubscription,
  } = useSubscriptionStore()

  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  async function handleManageBilling() {
    setPortalLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      window.location.href = data.url
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setPortalLoading(false)
    }
  }

  async function handleCheckout(priceId: string, tierKey: string) {
    setCheckoutLoading(tierKey)
    setError(null)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/patient/membership?success=true`,
          cancelUrl: `${window.location.origin}/patient/membership?cancelled=true`,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasActiveSubscription = status === 'active' || status === 'trialing'
  const currentTierData = currentTier ? MEMBERSHIP_TIERS[currentTier] : null

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Membership</h1>
        <p className="text-gray-600 mt-1">
          {hasActiveSubscription
            ? 'Manage your membership and billing'
            : 'Choose a membership plan to get started'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Current Membership Status */}
      {hasActiveSubscription && currentTierData && currentTier ? (
        <div className="mb-8">
          {/* Active Membership Card */}
          <div className="bg-white border-2 border-accent/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 text-accent rounded-lg">
                  {tierIcons[currentTier]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentTierData.name} Membership
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {currentTierData.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : status === 'trialing'
                        ? 'bg-blue-100 text-blue-700'
                        : status === 'past_due'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                  }`}
                >
                  {status === 'active'
                    ? 'Active'
                    : status === 'trialing'
                      ? 'Trial'
                      : status === 'past_due'
                        ? 'Past Due'
                        : 'Cancelled'}
                </span>
              </div>
            </div>

            {/* Billing Info */}
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentTierData.price.monthly
                      ? `${formatPrice(currentTierData.price.monthly)}/month`
                      : `${formatPrice(currentTierData.price.annual)}/year`}
                  </p>
                </div>
                {currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-gray-500">Next Billing Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(currentPeriodEnd)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 pt-6 border-t border-zinc-100">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Your Benefits
              </h3>
              <ul className="grid sm:grid-cols-2 gap-2">
                {currentTierData.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-wrap gap-3">
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* No Active Membership */}
          {status === 'cancelled' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
              Your membership has been cancelled. Choose a plan below to
              resubscribe.
            </div>
          )}

          {!status && (
            <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-sm">
              You do not have an active membership. Select a plan below to get
              started.
            </div>
          )}

          {status === 'past_due' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              Your last payment failed. Please update your payment method to
              continue your membership.
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="ml-2 font-semibold underline"
              >
                Update Payment
              </button>
            </div>
          )}

          {/* Tier Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {tierOrder.map((tierKey) => {
              const tier = MEMBERSHIP_TIERS[tierKey]
              const isHighlighted = tier.highlight
              const isLoading = checkoutLoading === tierKey

              return (
                <div
                  key={tierKey}
                  className={`relative rounded-xl border-2 p-6 flex flex-col bg-white transition-all duration-300 ${
                    isHighlighted
                      ? 'border-accent shadow-lg'
                      : 'border-zinc-200 hover:border-zinc-300 hover:shadow-md'
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-accent text-primary px-3 py-1 rounded-full text-xs font-semibold">
                        <Crown className="w-3 h-3" />
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`p-1.5 rounded-md ${
                        isHighlighted
                          ? 'bg-accent/10 text-accent'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {tierIcons[tierKey]}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {tier.name}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-4">
                    {tier.price.monthly ? (
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(tier.price.monthly)}
                        </span>
                        <span className="text-gray-500 text-sm">/month</span>
                        <p className="text-xs text-gray-400 mt-1">
                          or {formatPrice(tier.price.annual)}/year
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(tier.price.annual)}
                        </span>
                        <span className="text-gray-500 text-sm">/year</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                            isHighlighted ? 'text-accent' : 'text-green-500'
                          }`}
                        />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <button
                    onClick={() =>
                      handleCheckout(
                        `price_${tierKey}`, // placeholder price ID
                        tierKey
                      )
                    }
                    disabled={isLoading || checkoutLoading !== null}
                    className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isHighlighted
                        ? 'bg-accent text-primary hover:bg-accent/90'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

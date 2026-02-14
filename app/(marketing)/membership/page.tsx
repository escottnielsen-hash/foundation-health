import Link from 'next/link'
import { Check, Crown, Shield, Star } from 'lucide-react'
import { MEMBERSHIP_TIERS, type MembershipTierKey } from '@/lib/constants/membership'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

const tierIcons: Record<MembershipTierKey, React.ReactNode> = {
  platinum: <Crown className="w-8 h-8" />,
  gold: <Star className="w-8 h-8" />,
  silver: <Shield className="w-8 h-8" />,
}

const tierOrder: MembershipTierKey[] = ['silver', 'gold', 'platinum']

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Membership Plans
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience healthcare designed around you. Choose the membership tier
            that matches your wellness goals and lifestyle.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {tierOrder.map((tierKey) => {
              const tier = MEMBERSHIP_TIERS[tierKey]
              const isHighlighted = tier.highlight

              return (
                <div
                  key={tierKey}
                  className={`relative rounded-2xl border-2 p-8 flex flex-col transition-all duration-300 ${
                    isHighlighted
                      ? 'border-accent bg-white shadow-xl scale-[1.02] md:scale-105'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-lg'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 bg-accent text-primary px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                        <Crown className="w-4 h-4" />
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Tier Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        isHighlighted
                          ? 'bg-accent/10 text-accent'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {tierIcons[tierKey]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {tier.name}
                      </h2>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6">{tier.description}</p>

                  {/* Pricing */}
                  <div className="mb-8">
                    {tier.price.monthly ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground">
                            {formatPrice(tier.price.monthly)}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          or {formatPrice(tier.price.annual)}/year (save{' '}
                          {Math.round(
                            ((tier.price.monthly * 12 - tier.price.annual) /
                              (tier.price.monthly * 12)) *
                              100
                          )}
                          %)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground">
                            {formatPrice(tier.price.annual)}
                          </span>
                          <span className="text-muted-foreground">/year</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Annual commitment
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            isHighlighted ? 'text-accent' : 'text-green-500'
                          }`}
                        />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/register/patient"
                    className={`block w-full text-center py-3.5 px-8 rounded-lg font-semibold transition-all duration-300 ${
                      isHighlighted
                        ? 'bg-accent text-primary hover:bg-accent/90 shadow-sm hover:shadow-md'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    Apply for Membership
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Questions about membership?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our concierge team is available to walk you through each plan and help
            you find the perfect fit for your healthcare needs.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Contact our team
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

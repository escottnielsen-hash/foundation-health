import Link from 'next/link'
import { Crown, Star, Shield, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import type { MembershipTierName, MembershipStatus } from '@/types/database'

interface WelcomeBannerProps {
  firstName: string | null
  tier: MembershipTierName | null
  membershipStatus: MembershipStatus | null
  currentPeriodEnd: string | null
}

function getTierDisplay(tier: MembershipTierName) {
  switch (tier) {
    case 'platinum':
      return {
        icon: <Crown className="h-4 w-4" />,
        label: 'Platinum',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
      }
    case 'gold':
      return {
        icon: <Star className="h-4 w-4" />,
        label: 'Gold',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      }
    case 'silver':
      return {
        icon: <Shield className="h-4 w-4" />,
        label: 'Silver',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
      }
  }
}

function formatRenewalDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function WelcomeBanner({
  firstName,
  tier,
  membershipStatus,
  currentPeriodEnd,
}: WelcomeBannerProps) {
  const displayName = firstName || 'there'
  const tierDisplay = tier ? getTierDisplay(tier) : null

  return (
    <div
      id={elementId('dashboard', 'welcome', 'banner')}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 shadow-lg sm:px-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/5" />
      <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-amber-500/5" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {displayName}
            </h1>
            {tierDisplay && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tierDisplay.badgeClass}`}
              >
                {tierDisplay.icon}
                {tierDisplay.label} Member
              </div>
            )}
          </div>
          <p className="text-sm text-slate-300">
            Your personalized health dashboard
            {membershipStatus === 'active' && currentPeriodEnd && (
              <span className="ml-1 text-slate-400">
                &middot; Membership renews {formatRenewalDate(currentPeriodEnd)}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-amber-500 text-slate-900 hover:bg-amber-400"
          >
            <Link href="/patient/appointments/book">
              Book Appointment
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-slate-600 bg-transparent text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <Link href="/patient/travel/concierge">
              Concierge
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

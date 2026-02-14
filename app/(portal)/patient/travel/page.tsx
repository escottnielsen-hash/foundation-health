import Link from 'next/link'
import { LocationTravelCard } from '@/components/travel/location-travel-card'
import { Button } from '@/components/ui/button'
import { getLocationSummaries } from '@/lib/data/travel-guides'
import { elementId } from '@/lib/utils/element-ids'
import {
  ClipboardCheck,
  ConciergeBell,
  Plane,
  MapPin,
  Hotel,
  Car,
} from 'lucide-react'

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Travel & Concierge | Foundation Health',
  description:
    'Plan your luxury healthcare journey to a Foundation Health destination. Travel guides, accommodations, transportation, and concierge services.',
}

// ============================================
// Quick link data
// ============================================

interface QuickLink {
  label: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const quickLinks: QuickLink[] = [
  {
    label: 'Pre-Visit Checklist',
    description: 'Everything you need to prepare for your visit',
    href: '/patient/travel/checklist',
    icon: ClipboardCheck,
  },
  {
    label: 'Concierge Services',
    description: 'Let our team handle every detail of your trip',
    href: '/patient/travel/concierge',
    icon: ConciergeBell,
  },
]

// ============================================
// Page Component
// ============================================

export default function TravelPlanningPage() {
  const locations = getLocationSummaries()

  return (
    <div id={elementId('travel', 'page')} className="space-y-10">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(222,47%,11%)] to-[hsl(222,47%,20%)] p-8 text-white md:p-12">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Plane className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium uppercase tracking-wider text-amber-400">
              Travel & Concierge
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Plan Your Healthcare Journey
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
            Foundation Health transforms medical care into an extraordinary
            experience. From the moment you decide to visit, our concierge team
            ensures every detail of your journey is thoughtfully arranged.
            Select your destination below to begin planning.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-400/60" />
              4 Destinations
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <Hotel className="h-4 w-4 text-amber-400/60" />
              Curated Accommodations
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <Car className="h-4 w-4 text-amber-400/60" />
              Private Transportation
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-400/5" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-amber-400/5" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50 transition-colors group-hover:bg-amber-100">
                <Icon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{link.label}</p>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Location cards */}
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900">
            Choose Your Destination
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Each location offers a unique healing environment with curated travel
            experiences
          </p>
        </div>

        <div
          id={elementId('travel', 'locations-grid')}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >
          {locations.map((location) => (
            <LocationTravelCard key={location.slug} location={location} />
          ))}
        </div>
      </div>

      {/* Concierge CTA */}
      <div className="rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-amber-50/30 p-6 md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Prefer a White-Glove Experience?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Our concierge team can plan your entire trip — from flights and
              accommodations to dining reservations and recovery activities.
              Simply tell us your dates and preferences.
            </p>
          </div>
          <Button asChild className="flex-shrink-0">
            <Link href="/patient/travel/concierge">
              <ConciergeBell className="mr-2 h-4 w-4" />
              Contact Concierge
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

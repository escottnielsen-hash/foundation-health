import Link from 'next/link'
import { getLocations } from '@/lib/actions/locations'
import { LocationCard } from '@/components/locations/location-card'
import { MapPin, Mountain, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Destinations | Foundation Health',
  description:
    'Discover Foundation Health destination healthcare locations across the American West. Luxury surgical care, regenerative medicine, and wellness at Moab, Park City, Powder Mountain, and Camas.',
}

export default async function MarketingLocationsPage() {
  const result = await getLocations()
  const locations = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation spacer for fixed nav */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="relative py-24 lg:py-36 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Mountain className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-semibold tracking-widest uppercase text-sm">
              Our Destinations
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-8 leading-tight">
            Heal in Extraordinary Places
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Each Foundation Health destination is curated for its natural beauty, clinical
            distinction, and the conviction that where you heal matters as much as how.
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
              Hub & Spoke Network
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-primary mb-4">
              Four Destinations, One Standard of Excellence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Our hub-and-spoke model anchors world-class surgical infrastructure at Moab Regional
              Hospital, extending luxury care through specialized clinics across the Mountain West.
            </p>
          </div>

          {locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  variant="marketing"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Destinations coming soon
              </h3>
              <p className="text-gray-500 mt-1">
                We are preparing our destination healthcare network. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 font-display">
              Interactive Map Coming Soon
            </h3>
            <p className="text-gray-400 mt-2 max-w-md mx-auto">
              An interactive map of all Foundation Health destinations will be available here,
              showing travel routes, nearby airports, and accommodation options.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-6">
            Experience Destination Healthcare
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you choose the red rock canyons of Moab, the alpine grandeur of Park City,
            or the Pacific Northwest serenity of Camas, Foundation Health delivers an
            unparalleled standard of care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-semibold px-8 py-3.5 rounded-lg hover:bg-amber-400 transition-colors"
            >
              Schedule a Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Explore Membership
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

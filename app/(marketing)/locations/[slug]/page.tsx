import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocationBySlug, getLocations } from '@/lib/actions/locations'
import { locationSlugSchema } from '@/lib/validations/locations'
import { Badge } from '@/components/ui/badge'
import { getGradient } from '@/components/locations/location-card'
import { cn } from '@/lib/utils/cn'
import {
  MapPin,
  Phone,
  Building2,
  Star,
  ArrowRight,
  Mountain,
  Heart,
  Shield,
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
} from 'lucide-react'
import type { Metadata } from 'next'

// ============================================
// Types
// ============================================

interface MarketingLocationDetailPageProps {
  params: Promise<{ slug: string }>
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata(
  props: MarketingLocationDetailPageProps
): Promise<Metadata> {
  const { slug } = await props.params
  const parsed = locationSlugSchema.safeParse({ slug })
  if (!parsed.success) {
    return { title: 'Location Not Found | Foundation Health' }
  }

  const result = await getLocationBySlug(parsed.data.slug)
  if (!result.success) {
    return { title: 'Location Not Found | Foundation Health' }
  }

  const location = result.data
  return {
    title: `${location.name} | Foundation Health`,
    description:
      location.tagline ??
      location.description ??
      `Discover Foundation Health destination healthcare in ${location.city ?? location.name}.`,
  }
}

// ============================================
// Static generation for known slugs
// ============================================

export async function generateStaticParams() {
  const result = await getLocations()
  if (!result.success) return []

  return result.data
    .filter((loc) => loc.slug)
    .map((loc) => ({ slug: loc.slug! }))
}

// ============================================
// Feature icons mapping
// ============================================

const FEATURE_ICONS = [Sparkles, Heart, Shield, Star, Mountain, Users] as const

// ============================================
// Page
// ============================================

export default async function MarketingLocationDetailPage(
  props: MarketingLocationDetailPageProps
) {
  const { slug } = await props.params

  const parsed = locationSlugSchema.safeParse({ slug })
  if (!parsed.success) {
    notFound()
  }

  const result = await getLocationBySlug(parsed.data.slug)
  if (!result.success) {
    notFound()
  }

  const location = result.data
  const gradient = getGradient(location.slug, location.name)

  const features = Array.isArray(location.features)
    ? (location.features as string[])
    : []

  const amenities = Array.isArray(location.amenities)
    ? (location.amenities as string[])
    : []

  const cityState = [location.city, location.state].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation spacer */}
      <div className="h-20" />

      {/* Hero */}
      <section
        className={cn(
          'relative py-28 lg:py-40 bg-gradient-to-br overflow-hidden',
          gradient
        )}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/locations"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors mb-8"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All Destinations
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge
              className={cn(
                'text-sm capitalize',
                location.location_type === 'hub'
                  ? 'bg-amber-500/90 text-white border-amber-400'
                  : 'bg-white/20 text-white border-white/30'
              )}
            >
              {location.location_type}
            </Badge>
            {location.is_critical_access && (
              <Badge className="bg-white/20 text-white border-white/30 text-sm">
                Critical Access Hospital
              </Badge>
            )}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-6 leading-tight">
            {location.name}
          </h1>

          {location.tagline && (
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl leading-relaxed mb-4">
              {location.tagline}
            </p>
          )}

          {cityState && (
            <div className="flex items-center gap-2 text-white/60">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{cityState}</span>
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {location.description && (
        <section className="py-20 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed text-center">
              {location.description}
            </p>
          </div>
        </section>
      )}

      {/* Features Grid */}
      {features.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
                What Sets Us Apart
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-primary">
                Distinctive Features
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length]
                return (
                  <div
                    key={feature}
                    className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary font-display">
                      {feature}
                    </h3>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Location Details */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact & address */}
            <div>
              <h2 className="text-2xl font-bold font-display text-primary mb-8">
                Visit Us
              </h2>
              <div className="space-y-6">
                {location.address_line1 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-500 mt-0.5">
                        {location.address_line1}
                        {location.address_line2 && (
                          <>
                            <br />
                            {location.address_line2}
                          </>
                        )}
                        <br />
                        {cityState} {location.zip_code}
                      </p>
                    </div>
                  </div>
                )}
                {location.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-500 mt-0.5">{location.phone}</p>
                    </div>
                  </div>
                )}
                {location.is_critical_access && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Critical Access Hospital
                      </p>
                      <p className="text-gray-500 mt-0.5">
                        Federal designation enabling 101% cost-based reimbursement
                        for Medicare services, ensuring sustainable premium care delivery.
                      </p>
                    </div>
                  </div>
                )}
                {location.operating_hours && typeof location.operating_hours === 'object' && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Hours</p>
                      <p className="text-gray-500 mt-0.5">
                        Contact us for current operating hours
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-display text-primary mb-8">
                  Amenities & Services
                </h2>
                <div className="space-y-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                      <span className="text-gray-600">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Photo Gallery Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold font-display text-primary">Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-[4/3] rounded-xl bg-gradient-to-br opacity-60',
                  i === 0 ? gradient : 'from-gray-200 to-gray-300'
                )}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            Photography gallery coming soon
          </p>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-display text-primary leading-relaxed italic">
            &ldquo;The combination of world-class surgical care with the natural beauty
            of {location.name} created a healing experience unlike anything else.&rdquo;
          </blockquote>
          <p className="mt-6 text-gray-500">
            &mdash; Foundation Health Member
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className={cn(
          'py-24 lg:py-32 bg-gradient-to-br',
          gradient
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white mb-6">
            Experience Foundation Health in {location.city ?? location.name}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Begin your destination healthcare journey. Schedule a private consultation
            to learn how {location.name} can deliver the care you deserve in a setting
            that inspires healing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

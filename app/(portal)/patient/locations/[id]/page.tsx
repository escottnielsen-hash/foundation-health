import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getLocationById,
  getLocationProviders,
  getLocationServices,
} from '@/lib/actions/locations'
import { locationIdSchema } from '@/lib/validations/locations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getGradient } from '@/components/locations/location-card'
import { LocationDetailTabs } from './location-detail-tabs'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import {
  MapPin,
  Phone,
  Building2,
  ExternalLink,
  Navigation,
} from 'lucide-react'
import type { Metadata } from 'next'

// ============================================
// Types
// ============================================

interface LocationDetailPageProps {
  params: Promise<{ id: string }>
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata(
  props: LocationDetailPageProps
): Promise<Metadata> {
  const { id } = await props.params
  const parsed = locationIdSchema.safeParse({ id })
  if (!parsed.success) {
    return { title: 'Location Not Found | Foundation Health' }
  }

  const result = await getLocationById(parsed.data.id)
  if (!result.success) {
    return { title: 'Location Not Found | Foundation Health' }
  }

  const location = result.data
  return {
    title: `${location.name} | Foundation Health`,
    description:
      location.description ??
      `View details, providers, and services at ${location.name} — Foundation Health.`,
  }
}

// ============================================
// Helpers
// ============================================

function buildGoogleMapsUrl(location: {
  address_line1?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
}): string {
  const parts = [
    location.address_line1,
    location.city,
    location.state,
    location.zip_code,
  ].filter(Boolean)

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`
}

// ============================================
// Page
// ============================================

export default async function LocationDetailPage(props: LocationDetailPageProps) {
  const { id } = await props.params

  // Validate UUID
  const parsed = locationIdSchema.safeParse({ id })
  if (!parsed.success) {
    notFound()
  }

  // Fetch all data in parallel
  const [locationResult, providersResult, servicesResult] = await Promise.all([
    getLocationById(parsed.data.id),
    getLocationProviders(parsed.data.id),
    getLocationServices(parsed.data.id),
  ])

  if (!locationResult.success) {
    notFound()
  }

  const location = locationResult.data
  const providers = providersResult.success ? providersResult.data : []
  const services = servicesResult.success ? servicesResult.data : []
  const gradient = getGradient(location.slug, location.name)

  const fullAddress = [
    location.address_line1,
    location.address_line2,
    [location.city, location.state].filter(Boolean).join(', '),
    location.zip_code,
  ]
    .filter(Boolean)
    .join(', ')

  const googleMapsUrl = buildGoogleMapsUrl(location)

  return (
    <div id={elementId('location', 'detail', 'page')} className="space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/patient/locations"
          id={elementId('location', 'detail', 'back')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Locations
        </Link>
      </div>

      {/* Hero section */}
      <div
        id={elementId('location', 'detail', 'hero')}
        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        {/* Gradient header */}
        <div className={cn('h-32 bg-gradient-to-br', gradient)} />

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-8">
            {/* Location icon */}
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-xl border-4 border-white bg-gradient-to-br shadow-lg',
                gradient
              )}
              aria-hidden="true"
            >
              <Building2 className="h-8 w-8 text-white/90" />
            </div>

            {/* Name and badges */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
                {location.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge
                  variant={location.location_type === 'hub' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs capitalize',
                    location.location_type === 'hub'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : ''
                  )}
                >
                  {location.location_type}
                </Badge>
                {location.is_critical_access && (
                  <Badge variant="warning" className="text-xs">
                    Critical Access Hospital
                  </Badge>
                )}
                {location.city && location.state && (
                  <span className="text-sm text-gray-500">
                    {location.city}, {location.state}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex-shrink-0 flex gap-3">
              {fullAddress && (
                <Button variant="outline" asChild size="sm">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={elementId('location', 'detail', 'directions-btn')}
                  >
                    <Navigation className="h-4 w-4 mr-1.5" />
                    Get Directions
                  </a>
                </Button>
              )}
              <Button asChild>
                <Link
                  href={`/patient/appointments/book?location_id=${location.id}`}
                  id={elementId('location', 'detail', 'book-btn')}
                >
                  Book at This Location
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick info row */}
          <Separator className="my-5" />
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            {fullAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{fullAddress}</span>
              </div>
            )}
            {location.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${location.phone}`}
                  className="hover:text-gray-700 transition-colors"
                >
                  {location.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed content */}
      <LocationDetailTabs
        location={location}
        providers={providers}
        services={services}
        googleMapsUrl={googleMapsUrl}
      />
    </div>
  )
}

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import type { Location } from '@/types/database'
import { MapPin, Phone, Clock, Building2 } from 'lucide-react'

// ============================================
// Gradient map — each location gets a distinct gradient
// ============================================

const LOCATION_GRADIENTS: Record<string, string> = {
  moab: 'from-red-800 via-orange-700 to-amber-600',
  'park-city': 'from-sky-700 via-blue-600 to-indigo-500',
  'powder-mountain': 'from-slate-700 via-zinc-600 to-stone-500',
  camas: 'from-emerald-800 via-teal-700 to-cyan-600',
}

function getGradient(slug: string | null | undefined, name: string): string {
  if (slug && LOCATION_GRADIENTS[slug]) {
    return LOCATION_GRADIENTS[slug]
  }
  // Fallback: derive from name
  const key = name.toLowerCase().replace(/\s+/g, '-')
  if (LOCATION_GRADIENTS[key]) {
    return LOCATION_GRADIENTS[key]
  }
  return 'from-slate-700 via-slate-600 to-slate-500'
}

// ============================================
// Props
// ============================================

interface LocationCardProps {
  location: Location
  /** 'portal' links to /patient/locations/[id], 'marketing' links to /locations/[slug] */
  variant?: 'portal' | 'marketing'
  className?: string
}

// ============================================
// Component
// ============================================

export function LocationCard({ location, variant = 'portal', className }: LocationCardProps) {
  const gradient = getGradient(location.slug, location.name)
  const href =
    variant === 'marketing'
      ? `/locations/${location.slug ?? location.id}`
      : `/patient/locations/${location.id}`

  const fullAddress = [
    location.address_line1,
    location.address_line2,
    [location.city, location.state].filter(Boolean).join(', '),
    location.zip_code,
  ]
    .filter(Boolean)
    .join(', ')

  const features =
    Array.isArray(location.features) ? (location.features as string[]).slice(0, 4) : []

  return (
    <Link
      href={href}
      id={elementId('location', 'card', location.id)}
      className={cn(
        'group block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
    >
      {/* Gradient hero */}
      <div
        className={cn(
          'relative h-40 bg-gradient-to-br',
          gradient
        )}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-display font-bold text-white drop-shadow-md">
              {location.name}
            </h3>
            {location.city && location.state && (
              <p className="text-white/80 text-sm mt-0.5 drop-shadow-sm">
                {location.city}, {location.state}
              </p>
            )}
          </div>
          <Badge
            variant={location.location_type === 'hub' ? 'default' : 'secondary'}
            className={cn(
              'text-xs capitalize shrink-0',
              location.location_type === 'hub'
                ? 'bg-amber-500/90 text-white border-amber-400'
                : 'bg-white/90 text-gray-700 border-white/60'
            )}
          >
            {location.location_type}
          </Badge>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        {/* Tagline or description */}
        {location.tagline && (
          <p className="text-sm text-gray-600 line-clamp-2">{location.tagline}</p>
        )}
        {!location.tagline && location.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{location.description}</p>
        )}

        {/* Key details */}
        <div className="space-y-2 text-sm text-gray-500">
          {fullAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{fullAddress}</span>
            </div>
          )}
          {location.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{location.phone}</span>
            </div>
          )}
          {location.is_critical_access && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-amber-700 font-medium">Critical Access Hospital</span>
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// ============================================
// Export gradient helper for marketing pages
// ============================================

export { getGradient, LOCATION_GRADIENTS }

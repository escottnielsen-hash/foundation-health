import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import type { ProviderWithLocations } from '@/lib/actions/providers'

interface ProviderCardProps {
  provider: ProviderWithLocations
  className?: string
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = (firstName ?? '').trim()
  const last = (lastName ?? '').trim()
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?'
}

export function ProviderCard({ provider, className }: ProviderCardProps) {
  const firstName = provider.profiles?.first_name ?? ''
  const lastName = provider.profiles?.last_name ?? ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Provider'
  const initials = getInitials(firstName, lastName)

  const credentialsSuffix = provider.credentials
    ? `, ${provider.credentials}`
    : ''

  const locations = (provider.provider_locations ?? [])
    .map((pl) => pl.locations)
    .filter((loc): loc is NonNullable<typeof loc> => loc !== null)

  const bioPreview = provider.bio
    ? provider.bio.length > 120
      ? `${provider.bio.slice(0, 120)}...`
      : provider.bio
    : null

  return (
    <Link
      href={`/patient/providers/${provider.id}`}
      id={elementId('provider', 'card', provider.id)}
      className="block group"
    >
      <Card
        className={cn(
          'h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-amber-100 font-display text-lg font-semibold shadow-sm"
              aria-hidden="true"
            >
              {initials}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                {fullName}
                {credentialsSuffix && (
                  <span className="text-sm font-normal text-gray-500">
                    {credentialsSuffix}
                  </span>
                )}
              </h3>

              {provider.specialty && (
                <p className="mt-0.5 text-sm text-gray-600">
                  {provider.specialty}
                </p>
              )}

              {/* Location badges */}
              {locations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {locations.map((loc) => (
                    <Badge
                      key={loc.id}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {loc.city}, {loc.state}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Bio preview */}
              {bioPreview && (
                <p className="mt-2.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
                  {bioPreview}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

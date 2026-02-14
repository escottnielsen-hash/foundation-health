import { Suspense } from 'react'
import { getLocations, getLocationStates } from '@/lib/actions/locations'
import { locationFilterSchema } from '@/lib/validations/locations'
import { LocationCard } from '@/components/locations/location-card'
import { LocationFilter } from '@/components/locations/location-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { elementId } from '@/lib/utils/element-ids'
import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'

// ============================================
// Types
// ============================================

interface LocationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ============================================
// Metadata
// ============================================

export const metadata: Metadata = {
  title: 'Locations | Foundation Health',
  description:
    'Browse Foundation Health destination healthcare locations. View hours, services, providers, and directions for each location.',
}

// ============================================
// Page
// ============================================

export default async function PortalLocationsPage(props: LocationsPageProps) {
  const searchParams = await props.searchParams

  // Parse filters from search params
  const rawFilters = {
    state: typeof searchParams.state === 'string' ? searchParams.state : '',
    type: typeof searchParams.type === 'string' ? searchParams.type : '',
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
  }

  const parsed = locationFilterSchema.safeParse(rawFilters)
  const filters = parsed.success ? parsed.data : {}

  // Fetch data in parallel
  const [locationsResult, statesResult] = await Promise.all([
    getLocations(filters),
    getLocationStates(),
  ])

  const locations = locationsResult.success ? locationsResult.data : []
  const states = statesResult.success ? statesResult.data : []

  return (
    <div id={elementId('locations', 'page')} className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
          Our Locations
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Explore Foundation Health destination healthcare locations across the Mountain West.
          View hours, providers, services, and get directions.
        </p>
      </div>

      {/* Filters */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 flex-1" />
            </div>
          </div>
        }
      >
        <LocationFilter states={states} />
      </Suspense>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {locations.length === 0
            ? 'No locations found'
            : locations.length === 1
              ? '1 location found'
              : `${locations.length} locations found`}
        </p>
      </div>

      {/* Location grid */}
      {locations.length > 0 ? (
        <div
          id={elementId('locations', 'grid')}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              variant="portal"
            />
          ))}
        </div>
      ) : (
        <div
          id={elementId('locations', 'empty')}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No locations match your criteria
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Error display */}
      {!locationsResult.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            An error occurred while loading locations. Please try again later.
          </p>
        </div>
      )}
    </div>
  )
}

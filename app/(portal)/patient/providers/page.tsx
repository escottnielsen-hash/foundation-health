import { Suspense } from 'react'
import { getProviders, getLocations, getSpecialties } from '@/lib/actions/providers'
import { providerFilterSchema } from '@/lib/validations/providers'
import { ProviderCard } from '@/components/patient/provider-card'
import { ProviderFilter } from '@/components/patient/provider-filter'
import { Skeleton } from '@/components/ui/skeleton'
import { elementId } from '@/lib/utils/element-ids'

interface ProvidersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: 'Find a Provider | Foundation Health',
  description:
    'Browse our orthopedic specialists and sports medicine providers across Foundation Health locations.',
}

export default async function ProvidersPage(props: ProvidersPageProps) {
  const searchParams = await props.searchParams

  // Validate and parse search params
  const rawFilters = {
    specialty: typeof searchParams.specialty === 'string' ? searchParams.specialty : '',
    location_id: typeof searchParams.location_id === 'string' ? searchParams.location_id : '',
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
  }

  const parsed = providerFilterSchema.safeParse(rawFilters)
  const filters = parsed.success ? parsed.data : {}

  // Fetch data in parallel
  const [providersResult, locationsResult, specialtiesResult] = await Promise.all([
    getProviders(filters),
    getLocations(),
    getSpecialties(),
  ])

  const providers = providersResult.data
  const locations = locationsResult.data
  const specialties = specialtiesResult.data

  return (
    <div id={elementId('providers', 'page')} className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
          Find a Provider
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Explore our network of orthopedic surgeons and specialists delivering
          luxury destination healthcare across the Mountain West.
        </p>
      </div>

      {/* Filters */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <Skeleton className="h-11 flex-1" />
              <Skeleton className="h-11 w-56" />
              <Skeleton className="h-11 w-56" />
            </div>
          </div>
        }
      >
        <ProviderFilter locations={locations} specialties={specialties} />
      </Suspense>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {providers.length === 0
            ? 'No providers found'
            : providers.length === 1
              ? '1 provider found'
              : `${providers.length} providers found`}
        </p>
      </div>

      {/* Provider grid */}
      {providers.length > 0 ? (
        <div
          id={elementId('providers', 'grid')}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div
          id={elementId('providers', 'empty')}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No providers match your criteria
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}

      {/* Error display */}
      {providersResult.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            An error occurred while loading providers. Please try again later.
          </p>
        </div>
      )}
    </div>
  )
}

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServices, getServiceCategories } from '@/lib/actions/services'
import { Card, CardContent } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import { ServiceFilter } from '@/components/patient/service-filter'
import { ServiceCard } from '@/components/patient/service-card'
import { getCategoryLabel } from '@/lib/validations/services'
import type { ServiceFilterData } from '@/lib/validations/services'
import type { ServiceCatalog } from '@/types/database'

// ============================================
// Page props
// ============================================

interface ServicesPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort_by?: string
  }>
}

// ============================================
// Group services by category
// ============================================

function groupByCategory(
  services: ServiceCatalog[]
): Record<string, ServiceCatalog[]> {
  const groups: Record<string, ServiceCatalog[]> = {}

  for (const service of services) {
    const key = service.category ?? 'other'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(service)
  }

  return groups
}

// ============================================
// Page component
// ============================================

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams

  // Build filters from URL search params
  const filters: ServiceFilterData = {}
  if (resolvedParams.category) filters.category = resolvedParams.category
  if (resolvedParams.search) filters.search = resolvedParams.search
  if (resolvedParams.sort_by) filters.sort_by = resolvedParams.sort_by as ServiceFilterData['sort_by']

  // Fetch services and categories in parallel
  const [servicesResult, categoriesResult] = await Promise.all([
    getServices(Object.keys(filters).length > 0 ? filters : undefined),
    getServiceCategories(),
  ])

  if (!servicesResult.success) {
    return (
      <div id={elementId('services', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load services
        </h2>
        <p className="text-gray-500">{servicesResult.error}</p>
      </div>
    )
  }

  const services = servicesResult.data
  const categories = categoriesResult.success ? categoriesResult.data : []
  const grouped = groupByCategory(services)
  const categoryKeys = Object.keys(grouped).sort()

  // Determine if we're filtering (show flat list) or browsing (show grouped)
  const isFiltering =
    !!resolvedParams.category ||
    !!resolvedParams.search ||
    !!resolvedParams.sort_by

  return (
    <div id={elementId('services', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('services', 'header')} className="mb-8">
        <h1
          id={elementId('services', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Our Services
        </h1>
        <p
          id={elementId('services', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Transparent pricing for all services. No surprise bills, no hidden
          fees.
        </p>
      </div>

      {/* Cash-Pay Notice */}
      <div
        id={elementId('services', 'cash-pay-notice')}
        className="mb-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Cash-Pay Pricing Transparency
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Foundation Health is a cash-pay practice. All prices listed are our
              direct-pay rates with no insurance markups. Membership holders
              receive additional discounts.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div id={elementId('services', 'toolbar')} className="mb-6">
        <Suspense fallback={null}>
          <ServiceFilter categories={categories} />
        </Suspense>
        <p className="text-sm text-gray-500 mt-3">
          {services.length} {services.length === 1 ? 'service' : 'services'}{' '}
          available
        </p>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card id={elementId('services', 'empty')}>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No services found
            </h3>
            <p className="text-gray-500 text-sm">
              {resolvedParams.search || resolvedParams.category
                ? 'No services match your current filters. Try adjusting your search or category.'
                : 'Services will appear here once they are added to the catalog.'}
            </p>
          </CardContent>
        </Card>
      ) : isFiltering ? (
        /* Flat grid when filtering */
        <div
          id={elementId('services', 'grid')}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description ?? null}
              category={service.category ?? null}
              basePrice={service.base_price}
              durationMinutes={service.duration_minutes ?? null}
              isTelehealthEligible={service.is_telehealth_eligible}
            />
          ))}
        </div>
      ) : (
        /* Grouped by category when browsing */
        <div id={elementId('services', 'grouped')} className="space-y-10">
          {categoryKeys.map((categoryKey) => (
            <section key={categoryKey}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {getCategoryLabel(categoryKey)}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">
                  {grouped[categoryKey].length}{' '}
                  {grouped[categoryKey].length === 1 ? 'service' : 'services'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {grouped[categoryKey].map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    description={service.description ?? null}
                    category={service.category ?? null}
                    basePrice={service.base_price}
                    durationMinutes={service.duration_minutes ?? null}
                    isTelehealthEligible={service.is_telehealth_eligible}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProviderById } from '@/lib/actions/providers'
import { providerIdSchema } from '@/lib/validations/providers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import { ProviderDetailTabs } from './provider-detail-tabs'
import type { Json } from '@/types/database'

interface ProviderDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: ProviderDetailPageProps) {
  const { id } = await props.params
  const parsed = providerIdSchema.safeParse({ id })
  if (!parsed.success) {
    return { title: 'Provider Not Found | Foundation Health' }
  }

  const { data: provider } = await getProviderById(parsed.data.id)
  if (!provider || !provider.profiles) {
    return { title: 'Provider Not Found | Foundation Health' }
  }

  const name = `${provider.profiles.first_name ?? ''} ${provider.profiles.last_name ?? ''}`.trim()
  return {
    title: `${name}${provider.credentials ? `, ${provider.credentials}` : ''} | Foundation Health`,
    description: provider.bio
      ? provider.bio.slice(0, 160)
      : `${name} — ${provider.specialty ?? 'Specialist'} at Foundation Health`,
  }
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = (firstName ?? '').trim()
  const last = (lastName ?? '').trim()
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?'
}

interface EducationEntry {
  degree?: string
  institution?: string
  year?: number
}

function parseEducation(education: Json): EducationEntry[] {
  if (!Array.isArray(education)) return []
  const valid: EducationEntry[] = []
  for (const entry of education) {
    if (typeof entry === 'object' && entry !== null && !Array.isArray(entry)) {
      valid.push(entry as EducationEntry)
    }
  }
  return valid
}

export default async function ProviderDetailPage(props: ProviderDetailPageProps) {
  const { id } = await props.params

  // Validate UUID
  const parsed = providerIdSchema.safeParse({ id })
  if (!parsed.success) {
    notFound()
  }

  const { data: provider, error } = await getProviderById(parsed.data.id)

  if (error || !provider) {
    notFound()
  }

  const firstName = provider.profiles?.first_name ?? ''
  const lastName = provider.profiles?.last_name ?? ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Provider'
  const initials = getInitials(firstName, lastName)
  const credentialsSuffix = provider.credentials ? `, ${provider.credentials}` : ''

  const locations = (provider.provider_locations ?? [])
    .map((pl) => ({
      ...pl,
      location: pl.locations,
    }))
    .filter((pl) => pl.location !== null)

  const services = (provider.provider_services ?? [])
    .map((ps) => ({
      ...ps,
      service: ps.service_catalog,
    }))
    .filter((ps) => ps.service !== null)

  const educationEntries = parseEducation(provider.education ?? [])

  return (
    <div id={elementId('provider', 'detail', 'page')} className="space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          href="/patient/providers"
          id={elementId('provider', 'detail', 'back')}
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
          Back to Providers
        </Link>
      </div>

      {/* Hero section */}
      <div
        id={elementId('provider', 'detail', 'hero')}
        className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      >
        {/* Decorative header bar */}
        <div className="h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-slate-700 to-slate-900 text-amber-100 font-display text-2xl font-semibold shadow-lg"
              aria-hidden="true"
            >
              {initials}
            </div>

            {/* Name and credentials */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-gray-900 tracking-tight">
                {fullName}
                {credentialsSuffix && (
                  <span className="text-lg font-normal text-gray-500">
                    {credentialsSuffix}
                  </span>
                )}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {provider.specialty && (
                  <Badge variant="secondary" className="text-xs">
                    {provider.specialty}
                  </Badge>
                )}
                {provider.accepting_new_patients && (
                  <Badge variant="success" className="text-xs">
                    Accepting New Patients
                  </Badge>
                )}
                {provider.years_of_experience && (
                  <span className="text-sm text-gray-500">
                    {provider.years_of_experience}+ years of experience
                  </span>
                )}
              </div>
            </div>

            {/* Book appointment CTA */}
            <div className="flex-shrink-0">
              <Button asChild>
                <Link
                  href={`/patient/appointments?provider_id=${provider.id}`}
                  id={elementId('provider', 'detail', 'book-btn')}
                >
                  Book Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed content */}
      <ProviderDetailTabs
        provider={provider}
        fullName={fullName}
        educationEntries={educationEntries}
        locations={locations.map((pl) => ({
          id: pl.id,
          is_primary: pl.is_primary ?? false,
          days_available: pl.days_available ?? null,
          location: pl.location!,
        }))}
        services={services.map((ps) => ({
          id: ps.id,
          is_primary: ps.is_primary ?? false,
          custom_price: ps.custom_price ?? null,
          service: ps.service!,
        }))}
      />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPhysicianEncounters } from '@/lib/actions/physician-clinical'
import { EncounterList } from '@/components/physician/encounters/encounter-list'
import { elementId } from '@/lib/utils/element-ids'
import type { EncounterStatus } from '@/types/database'

interface PhysicianEncountersPageProps {
  searchParams: Promise<{
    status?: string
    date_from?: string
    date_to?: string
    patient_search?: string
  }>
}

export default async function PhysicianEncountersPage({ searchParams }: PhysicianEncountersPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams

  // Build filters from search params
  const validStatuses: EncounterStatus[] = ['checked_in', 'in_progress', 'completed', 'cancelled']
  const filters: {
    status?: EncounterStatus
    date_from?: string
    date_to?: string
    patient_search?: string
  } = {}

  if (resolvedParams.status && validStatuses.includes(resolvedParams.status as EncounterStatus)) {
    filters.status = resolvedParams.status as EncounterStatus
  }
  if (resolvedParams.date_from) {
    filters.date_from = resolvedParams.date_from
  }
  if (resolvedParams.date_to) {
    filters.date_to = resolvedParams.date_to
  }
  if (resolvedParams.patient_search) {
    filters.patient_search = resolvedParams.patient_search
  }

  const hasFilters = Object.keys(filters).length > 0
  const result = await getPhysicianEncounters(hasFilters ? filters : undefined)

  if (!result.success) {
    return (
      <div id={elementId('physician-encounters', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load encounters
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const encounters = result.data

  return (
    <div id={elementId('physician-encounters', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('physician-encounters', 'header')} className="mb-8">
        <h1
          id={elementId('physician-encounters', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Encounters
        </h1>
        <p
          id={elementId('physician-encounters', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Manage your patient encounters, clinical notes, and follow-ups
        </p>
      </div>

      {/* Encounter List with Filters */}
      <EncounterList
        encounters={encounters}
        totalCount={encounters.length}
      />
    </div>
  )
}

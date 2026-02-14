import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatientEncounters } from '@/lib/actions/encounters'
import { Card, CardContent } from '@/components/ui/card'
import { EncounterCard } from '@/components/patient/encounter-card'
import { EncounterFilter } from '@/components/patient/encounter-filter'
import { elementId } from '@/lib/utils/element-ids'

interface EncountersPageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function EncountersPage({ searchParams }: EncountersPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const filters = resolvedParams.type
    ? { encounter_type: resolvedParams.type }
    : undefined

  const result = await getPatientEncounters(user.id, filters)

  if (!result.success) {
    return (
      <div id={elementId('encounters', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load encounters
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const encounters = result.data

  return (
    <div id={elementId('encounters', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('encounters', 'header')} className="mb-8">
        <h1
          id={elementId('encounters', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Encounters
        </h1>
        <p
          id={elementId('encounters', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          View your clinical visits and encounter history
        </p>
      </div>

      {/* Filter Bar */}
      <div
        id={elementId('encounters', 'toolbar')}
        className="mb-6 flex items-center justify-between"
      >
        <EncounterFilter />
        <p className="text-sm text-gray-500">
          {encounters.length} {encounters.length === 1 ? 'encounter' : 'encounters'} found
        </p>
      </div>

      {/* Encounters List */}
      {encounters.length === 0 ? (
        <Card id={elementId('encounters', 'empty')}>
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No encounters found
            </h3>
            <p className="text-gray-500 text-sm">
              {resolvedParams.type
                ? 'No encounters match the selected filter. Try selecting a different type.'
                : 'Your clinical encounters will appear here after your visits with your care team.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div id={elementId('encounters', 'list')} className="space-y-3">
          {encounters.map((encounter) => (
            <EncounterCard
              key={encounter.id}
              id={encounter.id}
              checkInTime={encounter.check_in_time ?? null}
              providerName={encounter.provider_name ?? null}
              encounterType={encounter.encounter_type ?? null}
              chiefComplaint={encounter.chief_complaint ?? null}
              status={encounter.status}
              isTelehealth={encounter.is_telehealth ?? false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

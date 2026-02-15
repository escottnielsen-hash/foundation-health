import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPhysicianPatients } from '@/lib/actions/physician'
import { PatientList } from '@/components/physician/patients/patient-list'

// ============================================
// Physician Patients Page (Server Component)
// ============================================

export default async function PhysicianPatientsPage(props: {
  searchParams: Promise<{
    q?: string
    sort?: string
    date_from?: string
  }>
}) {
  const searchParams = await props.searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get physician_profile ID
  const { data: physicianProfile } = await supabase
    .from('physician_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!physicianProfile) {
    redirect('/dashboard')
  }

  const patients = await getPhysicianPatients(physicianProfile.id, {
    search_query: searchParams.q || undefined,
    sort_by: searchParams.sort || undefined,
    date_from: searchParams.date_from || undefined,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Patients</h2>
        <p className="mt-1 text-sm text-slate-500">
          View and manage patients you have treated
        </p>
      </div>

      {/* Patient List */}
      <PatientList patients={patients} />
    </div>
  )
}

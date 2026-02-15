import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatientDetailForPhysician } from '@/lib/actions/physician'
import { PatientDetail } from '@/components/physician/patients/patient-detail'

// ============================================
// Patient Detail Page (Server Component)
// ============================================

export default async function PhysicianPatientDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

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

  const patient = await getPatientDetailForPhysician(
    physicianProfile.id,
    params.id
  )

  if (!patient) {
    notFound()
  }

  return <PatientDetail patient={patient} />
}

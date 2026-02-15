import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTelemedicineProviders } from '@/lib/actions/telemedicine'
import { SessionRequestForm } from '@/components/patient/telemedicine/session-request-form'
import { elementId } from '@/lib/utils/element-ids'

export default async function TelemedicineRequestPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the patient profile to get patient_id
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!patientProfile) {
    redirect('/patient/dashboard')
  }

  // Fetch available providers for telemedicine
  const providersResult = await getTelemedicineProviders()
  const providers = providersResult.success ? providersResult.data : []

  return (
    <div id={elementId('telemedicine', 'request', 'container')} className="max-w-3xl">
      {/* Page Header */}
      <div id={elementId('telemedicine', 'request', 'header')} className="mb-8">
        <h1
          id={elementId('telemedicine', 'request', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Request Telemedicine Session
        </h1>
        <p
          id={elementId('telemedicine', 'request', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Schedule a virtual visit with your care team
        </p>
      </div>

      <SessionRequestForm
        providers={providers}
        patientId={patientProfile.id}
      />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSchedulingView } from '@/lib/actions/staff'
import { SchedulingTable } from '@/components/staff/scheduling/scheduling-table'

// ============================================
// Staff Scheduling Page (Server)
// ============================================

export default async function StaffSchedulingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]

  // Load today's appointments as default view
  const schedulingResult = await getSchedulingView({
    date_from: today,
    date_to: today,
  })

  const initialData = schedulingResult.success ? schedulingResult.data : []

  // Load physicians for filter dropdown
  const { data: physicianData } = await supabase
    .from('physician_profiles')
    .select(`
      id,
      physician_user:profiles!physician_profiles_user_id_fkey(
        first_name,
        last_name
      )
    `)
    .eq('is_active', true)

  const physicians = (physicianData ?? []).map((p) => {
    const rec = p as Record<string, unknown>
    const pUser = rec.physician_user as { first_name: string | null; last_name: string | null } | null
    const name = pUser
      ? [pUser.first_name, pUser.last_name].filter(Boolean).join(' ') || 'Unknown'
      : 'Unknown'
    return { id: rec.id as string, name }
  })

  // Load locations for filter dropdown
  const { data: locationData } = await supabase
    .from('locations')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const locations = (locationData ?? []).map((l) => ({
    id: l.id,
    name: l.name,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Scheduling
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage appointments across all physicians and locations.
        </p>
      </div>

      {/* Scheduling Table with Filters */}
      <SchedulingTable
        initialData={initialData}
        physicians={physicians}
        locations={locations}
      />
    </div>
  )
}

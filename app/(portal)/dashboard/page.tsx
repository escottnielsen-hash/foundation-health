import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the user's role to redirect to the appropriate dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'patient'

  switch (role) {
    case 'patient':
      redirect('/patient/dashboard')
    case 'physician':
      redirect('/physician/dashboard')
    case 'admin':
      redirect('/admin/dashboard')
    default:
      redirect('/patient/dashboard')
  }
}

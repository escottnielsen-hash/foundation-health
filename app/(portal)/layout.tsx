import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalLayoutShell } from '@/components/portal/portal-layout-shell'

async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, avatar_url, role')
    .eq('id', userId)
    .single()
  return data
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user.id)

  const userName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'User'
    : 'User'
  const userEmail = profile?.email || user.email || ''
  const userAvatarUrl = profile?.avatar_url ?? null

  return (
    <PortalLayoutShell
      userName={userName}
      userEmail={userEmail}
      userAvatarUrl={userAvatarUrl}
    >
      {children}
    </PortalLayoutShell>
  )
}

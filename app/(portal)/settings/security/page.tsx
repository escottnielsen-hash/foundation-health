import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PasswordChangeForm } from '@/components/settings/password-change-form'
import { ActiveSessions } from '@/components/settings/active-sessions'

// ============================================
// Security Settings Page (Server Component)
// ============================================

export default async function SecuritySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('two_factor_enabled')
    .eq('id', user.id)
    .single()

  const twoFactorEnabled = profile?.two_factor_enabled ?? false

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <PasswordChangeForm />

      {/* Active Sessions */}
      <ActiveSessions userEmail={user.email ?? ''} />

      {/* 2FA Placeholder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </div>
          <Badge variant={twoFactorEnabled ? 'success' : 'outline'}>
            {twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Two-factor authentication setup will be available in a future update.
            When enabled, you will be required to enter a verification code in
            addition to your password when signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

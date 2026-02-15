import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSettingsProfile } from '@/lib/actions/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SettingsProfileFormWrapper } from '@/components/settings/settings-profile-form'

// ============================================
// Settings Profile Page (Server Component)
// ============================================

export default async function SettingsProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getSettingsProfile()

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load profile
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const { profile, physicianProfile, patientProfile } = result.data

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {profile.role}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <ProfileField
              label="Email"
              value={profile.email}
            />
            <ProfileField
              label="Account Created"
              value={new Date(profile.created_at).toLocaleDateString()}
            />
            <ProfileField
              label="Email Verified"
              value={profile.email_verified ? 'Yes' : 'No'}
            />
            <ProfileField
              label="Last Login"
              value={
                profile.last_login_at
                  ? new Date(profile.last_login_at).toLocaleDateString()
                  : 'Never'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Physician-specific read-only info */}
      {profile.role === 'physician' && physicianProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Credentials</CardTitle>
            <CardDescription>
              Your medical credentials and specialty (read-only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <ProfileField
                label="Specialty"
                value={physicianProfile.specialty ?? 'Not set'}
              />
              <ProfileField
                label="Credentials"
                value={physicianProfile.credentials ?? 'Not set'}
              />
              <ProfileField
                label="NPI"
                value={physicianProfile.npi ?? 'Not set'}
              />
              <ProfileField
                label="License"
                value={
                  physicianProfile.license_number
                    ? `${physicianProfile.license_number} (${physicianProfile.license_state ?? ''})`
                    : 'Not set'
                }
              />
              {physicianProfile.board_certifications && physicianProfile.board_certifications.length > 0 && (
                <ProfileField
                  label="Board Certifications"
                  value={physicianProfile.board_certifications.join(', ')}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editable Profile Form */}
      <SettingsProfileFormWrapper
        profile={profile}
        physicianProfile={physicianProfile}
        patientProfile={patientProfile}
      />
    </div>
  )
}

// ============================================
// Helper component
// ============================================

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatientProfile } from '@/lib/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import { ProfileFormWrapper } from '@/components/patient/profile-form'
import { format } from 'date-fns'

export default async function PatientProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getPatientProfile(user.id)

  if (!result.success) {
    return (
      <div id={elementId('profile', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load profile
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const { profile, patientProfile } = result.data

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Not set'
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const formatAddress = (): string => {
    const parts = [
      profile.address_line1,
      profile.address_line2,
      profile.city,
      profile.state ? `${profile.state} ${profile.zip_code ?? ''}`.trim() : profile.zip_code,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Not set'
  }

  return (
    <div id={elementId('profile', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('profile', 'header')} className="mb-8">
        <h1
          id={elementId('profile', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          My Profile
        </h1>
        <p
          id={elementId('profile', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Manage your personal information and health details
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card
        id={elementId('profile', 'overview', 'card')}
        className="mb-6"
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic information and contact details
            </CardDescription>
          </div>
          <Badge variant="success">Active</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <ProfileField
                label="Full Name"
                value={
                  profile.first_name || profile.last_name
                    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
                    : 'Not set'
                }
              />
              <ProfileField
                label="Email"
                value={profile.email}
              />
              <ProfileField
                label="Phone"
                value={profile.phone ?? 'Not set'}
              />
              <ProfileField
                label="Date of Birth"
                value={formatDate(profile.date_of_birth)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <ProfileField
                label="Address"
                value={formatAddress()}
              />
              {patientProfile?.mrn && (
                <ProfileField
                  label="Medical Record Number"
                  value={patientProfile.mrn}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      <Card
        id={elementId('profile', 'emergency', 'card')}
        className="mb-6"
      >
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>
            Who should we contact in case of an emergency
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientProfile?.emergency_contact_name ? (
            <div className="grid md:grid-cols-2 gap-6">
              <ProfileField
                label="Contact Name"
                value={patientProfile.emergency_contact_name}
              />
              <ProfileField
                label="Contact Phone"
                value={patientProfile.emergency_contact_phone ?? 'Not set'}
              />
              {patientProfile.emergency_contact_relationship && (
                <ProfileField
                  label="Relationship"
                  value={patientProfile.emergency_contact_relationship}
                />
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No emergency contact information on file. Please add one by editing your profile.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Insurance Card */}
      <Card
        id={elementId('profile', 'insurance', 'card')}
        className="mb-6"
      >
        <CardHeader>
          <CardTitle>Insurance Information</CardTitle>
          <CardDescription>
            Your current insurance coverage details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patientProfile?.insurance_provider ? (
            <div className="grid md:grid-cols-2 gap-6">
              <ProfileField
                label="Insurance Provider"
                value={patientProfile.insurance_provider}
              />
              <ProfileField
                label="Policy Number"
                value={patientProfile.insurance_policy_number ?? 'Not set'}
              />
              {patientProfile.insurance_group_number && (
                <ProfileField
                  label="Group Number"
                  value={patientProfile.insurance_group_number}
                />
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No insurance information on file. Contact your care team to add insurance details.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Section */}
      <ProfileFormWrapper
        userId={user.id}
        profile={profile}
        patientProfile={patientProfile}
      />
    </div>
  )
}

// ============================================
// Helper component for displaying profile fields
// ============================================

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

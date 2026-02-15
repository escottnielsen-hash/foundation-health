import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPhysicianProfileData } from '@/lib/actions/physician-clinical'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PhysicianProfileForm } from '@/components/physician/profile/physician-profile-form'
import { elementId } from '@/lib/utils/element-ids'
import {
  User,
  Stethoscope,
  Award,
  GraduationCap,
  Shield,
  Globe,
  Camera,
} from 'lucide-react'

export default async function PhysicianProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getPhysicianProfileData()

  if (!result.success) {
    return (
      <div id={elementId('physician-profile', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load profile
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const { profile, physicianProfile } = result.data

  const fullName =
    profile.first_name || profile.last_name
      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
      : 'Not set'

  return (
    <div id={elementId('physician-profile', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('physician-profile', 'header')} className="mb-8">
        <h1
          id={elementId('physician-profile', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          My Profile
        </h1>
        <p
          id={elementId('physician-profile', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Manage your professional information and credentials
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Overview Card */}
          <Card id={elementId('physician-profile', 'overview', 'card')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your basic information and contact details
                </CardDescription>
              </div>
              <Badge variant={physicianProfile?.is_active ? 'success' : 'secondary'}>
                {physicianProfile?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={fullName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                    title="Upload photo (coming soon)"
                  >
                    <Camera className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {physicianProfile?.credentials
                      ? `${fullName}, ${physicianProfile.credentials}`
                      : fullName}
                  </p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  {physicianProfile?.specialty && (
                    <p className="text-sm text-primary mt-0.5">
                      {physicianProfile.specialty}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <ProfileField label="Full Name" value={fullName} />
                <ProfileField label="Email" value={profile.email} />
                <ProfileField label="Phone" value={profile.phone ?? 'Not set'} />
                <ProfileField
                  label="Accepting New Patients"
                  value={physicianProfile?.accepting_new_patients ? 'Yes' : 'No'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <PhysicianProfileForm
            profile={profile}
            physicianProfile={physicianProfile}
          />
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Credentials & License Card */}
          <Card id={elementId('physician-profile', 'credentials', 'card')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Credentials & License</CardTitle>
              </div>
              <CardDescription>
                Managed by administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileField
                label="NPI Number"
                value={physicianProfile?.npi ?? 'Not on file'}
              />
              <Separator />
              <ProfileField
                label="License Number"
                value={physicianProfile?.license_number ?? 'Not on file'}
              />
              <ProfileField
                label="License State"
                value={physicianProfile?.license_state ?? 'Not on file'}
              />
              <Separator />
              <ProfileField
                label="Credentials"
                value={physicianProfile?.credentials ?? 'Not on file'}
              />
              {physicianProfile?.is_verified && (
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialty & Certifications Card */}
          <Card id={elementId('physician-profile', 'specialty', 'card')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Specialty</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileField
                label="Primary Specialty"
                value={physicianProfile?.specialty ?? 'Not set'}
              />
              {physicianProfile?.subspecialties &&
                physicianProfile.subspecialties.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1.5">
                      Subspecialties
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {physicianProfile.subspecialties.map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {physicianProfile?.years_of_experience != null && (
                <ProfileField
                  label="Years of Experience"
                  value={String(physicianProfile.years_of_experience)}
                />
              )}
            </CardContent>
          </Card>

          {/* Board Certifications Card */}
          <Card id={elementId('physician-profile', 'certifications', 'card')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Board Certifications</CardTitle>
              </div>
              <CardDescription>Managed by administration</CardDescription>
            </CardHeader>
            <CardContent>
              {physicianProfile?.board_certifications &&
              physicianProfile.board_certifications.length > 0 ? (
                <ul className="space-y-2">
                  {physicianProfile.board_certifications.map((cert) => (
                    <li
                      key={cert}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <Award className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No board certifications on file. Contact administration to update.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card id={elementId('physician-profile', 'education', 'card')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Education</CardTitle>
              </div>
              <CardDescription>Managed by administration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ProfileField
                label="Medical School"
                value={physicianProfile?.medical_school ?? 'Not on file'}
              />
              {physicianProfile?.graduation_year != null && (
                <ProfileField
                  label="Graduation Year"
                  value={String(physicianProfile.graduation_year)}
                />
              )}
              {physicianProfile?.residency && (
                <ProfileField
                  label="Residency"
                  value={physicianProfile.residency}
                />
              )}
              {physicianProfile?.fellowship && (
                <ProfileField
                  label="Fellowship"
                  value={physicianProfile.fellowship}
                />
              )}
            </CardContent>
          </Card>

          {/* Languages Card */}
          {physicianProfile?.languages && physicianProfile.languages.length > 0 && (
            <Card id={elementId('physician-profile', 'languages', 'card')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Languages</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {physicianProfile.languages.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
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

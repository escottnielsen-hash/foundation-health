'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { UserDetail, UserActivitySummary } from '@/types/settings'
import { elementId } from '@/lib/utils/element-ids'
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  Clock,
} from 'lucide-react'

// ============================================
// Role badge variant mapping
// ============================================

function getRoleBadgeVariant(role: string): 'default' | 'success' | 'warning' | 'outline' {
  switch (role) {
    case 'admin':
      return 'default'
    case 'physician':
      return 'success'
    case 'staff':
      return 'warning'
    default:
      return 'outline'
  }
}

// ============================================
// User Detail Card
// ============================================

interface UserDetailCardProps {
  user: UserDetail
  activity: UserActivitySummary
}

export function UserDetailCard({ user, activity }: UserDetailCardProps) {
  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
      : 'Name not set'

  const address = [
    user.address_line1,
    user.address_line2,
    user.city,
    user.state ? `${user.state} ${user.zip_code ?? ''}`.trim() : user.zip_code,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div id={elementId('admin', 'user-detail', 'card')} className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">{fullName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
              {user.role}
            </Badge>
            <Badge variant={user.email_verified ? 'success' : 'outline'}>
              {user.email_verified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoRow
              icon={Mail}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={user.phone ?? 'Not set'}
            />
            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={
                user.date_of_birth
                  ? new Date(user.date_of_birth).toLocaleDateString()
                  : 'Not set'
              }
            />
            <InfoRow
              icon={MapPin}
              label="Address"
              value={address || 'Not set'}
            />
            <InfoRow
              icon={Shield}
              label="Two-Factor Auth"
              value={user.two_factor_enabled ? 'Enabled' : 'Disabled'}
            />
            <InfoRow
              icon={Clock}
              label="Account Created"
              value={new Date(user.created_at).toLocaleDateString()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>
            Overview of user activity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatBlock
              label="Last Login"
              value={
                activity.last_login_at
                  ? new Date(activity.last_login_at).toLocaleDateString()
                  : 'Never'
              }
            />

            <Separator orientation="vertical" className="hidden md:block h-12 mx-auto" />

            <StatBlock
              label="Appointments"
              value={activity.total_appointments.toLocaleString()}
            />
            <StatBlock
              label="Encounters"
              value={activity.total_encounters.toLocaleString()}
            />
            <StatBlock
              label="Claims"
              value={activity.total_claims.toLocaleString()}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Helper components
// ============================================

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
      <div>
        <dt className="text-xs font-medium text-gray-500">{label}</dt>
        <dd className="text-sm text-gray-900">{value}</dd>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

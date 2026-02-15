import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionsTable } from '@/components/admin/telemedicine/sessions-table'
import {
  getAllSessions,
  getPhysicianList,
} from '@/lib/actions/admin/telemedicine'
import type {
  SessionFilters,
  SessionStatus as TelemedicineSessionStatus,
  SessionType as TelemedicineSessionType,
} from '@/lib/actions/admin/telemedicine'
import { ArrowLeft } from 'lucide-react'
import { SessionsFilters } from './sessions-filters'

// ============================================
// Types
// ============================================

interface PageProps {
  searchParams: Promise<{
    status?: string
    type?: string
    physician?: string
    from?: string
    to?: string
  }>
}

// ============================================
// Valid filter values
// ============================================

const validStatuses: TelemedicineSessionStatus[] = [
  'scheduled',
  'waiting_room',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]

const validTypes: TelemedicineSessionType[] = [
  'pre_op_consult',
  'post_op_followup',
  'general_consult',
  'second_opinion',
  'urgent_care',
]

// ============================================
// Sessions List Page (Server)
// ============================================

export default async function TelemedicineSessionsPage(props: PageProps) {
  const searchParams = await props.searchParams

  const filters: SessionFilters = {}

  if (searchParams.status && validStatuses.includes(searchParams.status as TelemedicineSessionStatus)) {
    filters.status = searchParams.status as TelemedicineSessionStatus
  }
  if (searchParams.type && validTypes.includes(searchParams.type as TelemedicineSessionType)) {
    filters.session_type = searchParams.type as TelemedicineSessionType
  }
  if (searchParams.physician) {
    filters.physician_id = searchParams.physician
  }
  if (searchParams.from) {
    filters.date_from = searchParams.from
  }
  if (searchParams.to) {
    filters.date_to = searchParams.to
  }

  const [sessionsResult, physiciansResult] = await Promise.all([
    getAllSessions(filters),
    getPhysicianList(),
  ])

  const sessions = sessionsResult.success ? sessionsResult.data : []
  const physicians = physiciansResult.success ? physiciansResult.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/telemedicine">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              All Sessions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <SessionsFilters
        physicians={physicians}
        currentStatus={searchParams.status ?? ''}
        currentType={searchParams.type ?? ''}
        currentPhysician={searchParams.physician ?? ''}
        currentFrom={searchParams.from ?? ''}
        currentTo={searchParams.to ?? ''}
      />

      {/* Sessions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  )
}

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionStats } from '@/components/admin/telemedicine/session-stats'
import { SessionsTable } from '@/components/admin/telemedicine/sessions-table'
import { PendingRequests } from '@/components/admin/telemedicine/pending-requests'
import {
  getTelemedicineStats,
  getAllSessions,
  getPendingSessionRequests,
} from '@/lib/actions/admin/telemedicine'
import { ArrowRight, List } from 'lucide-react'

// ============================================
// Telemedicine Admin Dashboard Page (Server)
// ============================================

export default async function TelemedicineAdminPage() {
  const [statsResult, sessionsResult, pendingResult] = await Promise.all([
    getTelemedicineStats(),
    getAllSessions(),
    getPendingSessionRequests(),
  ])

  const stats = statsResult.success
    ? statsResult.data
    : {
        totalSessions: 0,
        completedSessions: 0,
        completionRate: 0,
        averageDurationMinutes: 0,
        pendingRequests: 0,
        byType: { pre_op_consult: 0, post_op_followup: 0, general_consult: 0, second_opinion: 0, urgent_care: 0 },
        byPhysician: [],
      }

  const recentSessions = sessionsResult.success
    ? sessionsResult.data.slice(0, 10)
    : []

  const pendingSessions = pendingResult.success
    ? pendingResult.data
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Telemedicine
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage telemedicine sessions, approvals, and analytics.
          </p>
        </div>
        <Link href="/admin/telemedicine/sessions">
          <Button variant="outline" size="sm">
            <List className="mr-2 h-4 w-4" />
            All Sessions
          </Button>
        </Link>
      </div>

      {/* Stats and Analytics */}
      <SessionStats stats={stats} />

      {/* Pending Requests */}
      {pendingSessions.length > 0 && (
        <PendingRequests sessions={pendingSessions} />
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Sessions</CardTitle>
              <CardDescription>
                Latest telemedicine sessions across all physicians
              </CardDescription>
            </div>
            <Link
              href="/admin/telemedicine/sessions"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={recentSessions} />
        </CardContent>
      </Card>
    </div>
  )
}

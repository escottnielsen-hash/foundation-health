import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuditLogs, getAuditLogStats } from '@/lib/actions/admin/audit-log'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogTable } from '@/components/admin/audit-log/audit-log-table'
import { elementId } from '@/lib/utils/element-ids'
import type { AuditLogFilter } from '@/types/settings'

// ============================================
// Audit Log Page (Server Component)
// ============================================

interface AuditLogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AuditLogPage(props: AuditLogPageProps) {
  const searchParams = await props.searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/patient/dashboard')
  }

  // Parse search params into filter
  const filters: AuditLogFilter = {
    date_from: (typeof searchParams.date_from === 'string' ? searchParams.date_from : undefined),
    date_to: (typeof searchParams.date_to === 'string' ? searchParams.date_to : undefined),
    user_id: (typeof searchParams.user_id === 'string' ? searchParams.user_id : undefined),
    action: (typeof searchParams.action === 'string' ? searchParams.action : undefined) as AuditLogFilter['action'],
    table_name: (typeof searchParams.table_name === 'string' ? searchParams.table_name : undefined),
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) || 1 : 1,
    per_page: 25,
  }

  const [logsResult, statsResult] = await Promise.all([
    getAuditLogs(filters as Record<string, unknown>),
    getAuditLogStats(),
  ])

  return (
    <div id={elementId('admin', 'audit-log', 'page')} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-1">
          View system activity and changes
        </p>
      </div>

      {/* Stats Summary */}
      {statsResult.success && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Entries</CardDescription>
              <CardTitle className="text-2xl">
                {statsResult.data.total_entries.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          {Object.entries(statsResult.data.by_action)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([action, count]) => (
              <Card key={action}>
                <CardHeader className="pb-2">
                  <CardDescription className="capitalize">{action}</CardDescription>
                  <CardTitle className="text-2xl">
                    {count.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
        </div>
      )}

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            All recorded system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsResult.success ? (
            <AuditLogTable
              logs={logsResult.data.logs}
              total={logsResult.data.total}
              page={logsResult.data.page}
              perPage={logsResult.data.per_page}
              totalPages={logsResult.data.total_pages}
              currentFilters={filters}
            />
          ) : (
            <p className="text-sm text-gray-500">{logsResult.error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AuditLogFilterBar } from '@/components/admin/audit-log/audit-log-filter'
import type { AuditLogEntry, AuditLogFilter } from '@/types/settings'
import { elementId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Action badge color mapping
// ============================================

function getActionVariant(action: string): 'default' | 'success' | 'destructive' | 'warning' | 'outline' {
  switch (action) {
    case 'create':
      return 'success'
    case 'delete':
      return 'destructive'
    case 'update':
      return 'warning'
    case 'login':
    case 'logout':
      return 'outline'
    default:
      return 'default'
  }
}

// ============================================
// Audit Log Table
// ============================================

interface AuditLogTableProps {
  logs: AuditLogEntry[]
  total: number
  page: number
  perPage: number
  totalPages: number
  currentFilters: AuditLogFilter
}

export function AuditLogTable({
  logs,
  total,
  page,
  perPage,
  totalPages,
  currentFilters,
}: AuditLogTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const buildUrl = useCallback(
    (filters: AuditLogFilter) => {
      const params = new URLSearchParams()
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)
      if (filters.user_id) params.set('user_id', filters.user_id)
      if (filters.action) params.set('action', filters.action)
      if (filters.table_name) params.set('table_name', filters.table_name)
      if (filters.page && filters.page > 1) params.set('page', String(filters.page))
      const qs = params.toString()
      return `/admin/audit-log${qs ? `?${qs}` : ''}`
    },
    []
  )

  const handleFilterChange = (filters: AuditLogFilter) => {
    router.push(buildUrl(filters))
  }

  const handlePageChange = (newPage: number) => {
    router.push(buildUrl({ ...currentFilters, page: newPage }))
  }

  return (
    <div id={elementId('admin', 'audit-log', 'table-container')}>
      {/* Filters */}
      <AuditLogFilterBar
        currentFilters={currentFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No audit log entries found.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <span className="font-medium">
                        {log.user_full_name || 'System'}
                      </span>
                      {log.user_email && (
                        <span className="block text-xs text-gray-500">
                          {log.user_email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action)} className="capitalize">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {log.table_name}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono max-w-[120px] truncate">
                    {log.record_id ?? '-'}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {log.ip_address ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of{' '}
              {total.toLocaleString()} entries
            </p>
            <div className="flex gap-2">
              <Button
                id={btnId('prev', 'audit-page')}
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                id={btnId('next', 'audit-page')}
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

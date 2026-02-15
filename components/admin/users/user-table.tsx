'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
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
import { UserFilterBar } from '@/components/admin/users/user-filter'
import type { UserListItem, UserListFilter } from '@/types/settings'
import { elementId, btnId } from '@/lib/utils/element-ids'

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
// User Table
// ============================================

interface UserTableProps {
  users: UserListItem[]
  total: number
  page: number
  perPage: number
  totalPages: number
  currentFilters: UserListFilter
}

export function UserTable({
  users,
  total,
  page,
  perPage,
  totalPages,
  currentFilters,
}: UserTableProps) {
  const router = useRouter()

  // Use local state for search debouncing
  const [localSearch, setLocalSearch] = useState(currentFilters.search ?? '')
  const [localFilters, setLocalFilters] = useState<UserListFilter>(currentFilters)

  // Sync localSearch from currentFilters on navigation
  useEffect(() => {
    setLocalSearch(currentFilters.search ?? '')
    setLocalFilters(currentFilters)
  }, [currentFilters])

  const buildUrl = useCallback(
    (filters: UserListFilter) => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.role) params.set('role', filters.role)
      if (filters.page && filters.page > 1) params.set('page', String(filters.page))
      const qs = params.toString()
      return `/admin/users${qs ? `?${qs}` : ''}`
    },
    []
  )

  // Debounce search — navigate after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (currentFilters.search ?? '')) {
        router.push(buildUrl({ ...localFilters, search: localSearch, page: 1 }))
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localSearch, localFilters, currentFilters.search, router, buildUrl])

  const handleFilterChange = (filters: UserListFilter) => {
    setLocalFilters(filters)
    setLocalSearch(filters.search ?? '')
    // For non-search changes, navigate immediately
    router.push(buildUrl(filters))
  }

  const handlePageChange = (newPage: number) => {
    router.push(buildUrl({ ...localFilters, page: newPage }))
  }

  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div id={elementId('admin', 'users', 'table-container')}>
      {/* Filters */}
      <UserFilterBar
        currentFilters={{ ...localFilters, search: localSearch }}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No users found.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(u.id)}
                >
                  <TableCell className="font-medium text-sm">
                    {u.first_name || u.last_name
                      ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
                      : 'Not set'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(u.role)} className="capitalize">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.email_verified ? 'success' : 'outline'}>
                      {u.email_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleDateString()
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of{' '}
              {total.toLocaleString()} users
            </p>
            <div className="flex gap-2">
              <Button
                id={btnId('prev', 'users-page')}
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                id={btnId('next', 'users-page')}
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

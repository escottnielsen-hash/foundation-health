import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUsers } from '@/lib/actions/admin/users'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserTable } from '@/components/admin/users/user-table'
import { elementId } from '@/lib/utils/element-ids'
import type { UserListFilter } from '@/types/settings'
import type { UserRole } from '@/types/database'

// ============================================
// Users List Page (Server Component)
// ============================================

interface UsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function UsersPage(props: UsersPageProps) {
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

  // Parse search params
  const filters: UserListFilter = {
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    role: (typeof searchParams.role === 'string' ? searchParams.role : undefined) as UserRole | '' | undefined,
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) || 1 : 1,
    per_page: 20,
  }

  const result = await getUsers(filters as Record<string, unknown>)

  return (
    <div id={elementId('admin', 'users', 'page')} className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">
          View and manage all platform users
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {result.success
              ? `${result.data.total.toLocaleString()} users found`
              : 'Users list'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.success ? (
            <UserTable
              users={result.data.users}
              total={result.data.total}
              page={result.data.page}
              perPage={result.data.per_page}
              totalPages={result.data.total_pages}
              currentFilters={filters}
            />
          ) : (
            <p className="text-sm text-gray-500">{result.error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

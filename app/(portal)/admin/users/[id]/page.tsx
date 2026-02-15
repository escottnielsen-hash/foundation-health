import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserById } from '@/lib/actions/admin/users'
import { UserDetailCard } from '@/components/admin/users/user-detail-card'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ============================================
// User Detail Page (Server Component)
// ============================================

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage(props: UserDetailPageProps) {
  const params = await props.params

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

  const result = await getUserById(params.id)

  if (!result.success) {
    return (
      <div id={elementId('admin', 'user-detail', 'error')} className="space-y-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            User not found
          </h2>
          <p className="text-gray-500">{result.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div id={elementId('admin', 'user-detail', 'page')} className="space-y-6">
      {/* Back Link */}
      <Link href="/admin/users">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </Link>

      {/* User Detail */}
      <UserDetailCard
        user={result.data.user}
        activity={result.data.activity}
      />
    </div>
  )
}

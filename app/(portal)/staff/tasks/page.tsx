import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffTasks } from '@/lib/actions/staff'
import { TaskList } from '@/components/staff/tasks/task-list'

// ============================================
// Staff Tasks Page (Server)
// ============================================

export default async function StaffTasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load all non-completed tasks by default
  const tasksResult = await getStaffTasks({
    status: null,
    category: null,
    priority: null,
    date_from: null,
    date_to: null,
  })

  const initialTasks = tasksResult.success ? tasksResult.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Task Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage insurance verifications, follow-up scheduling, document requests,
          and general staff tasks.
        </p>
      </div>

      {/* Task List with Filters */}
      <TaskList initialData={initialTasks} />
    </div>
  )
}

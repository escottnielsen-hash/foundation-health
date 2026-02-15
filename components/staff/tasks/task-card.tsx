'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, User, Tag } from 'lucide-react'
import { completeTask } from '@/lib/actions/staff'
import type { StaffTaskWithDetails } from '@/types/staff'

// ============================================
// Priority badge
// ============================================

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'low':
      return <Badge variant="outline" className="text-gray-600">Low</Badge>
    case 'normal':
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Normal</Badge>
    case 'high':
      return <Badge variant="warning">High</Badge>
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

// ============================================
// Category label
// ============================================

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'insurance_verification':
      return 'Insurance Verification'
    case 'follow_up_scheduling':
      return 'Follow-up Scheduling'
    case 'document_request':
      return 'Document Request'
    case 'general':
      return 'General'
    default:
      return category
  }
}

// ============================================
// Status badge
// ============================================

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="outline">Pending</Badge>
    case 'in_progress':
      return <Badge className="border-transparent bg-blue-100 text-blue-800">In Progress</Badge>
    case 'completed':
      return <Badge variant="success">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ============================================
// TaskCard
// ============================================

interface TaskCardProps {
  task: StaffTaskWithDetails
  onTaskUpdated: () => void
}

export function TaskCard({ task, onTaskUpdated }: TaskCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canComplete = task.status === 'pending' || task.status === 'in_progress'

  const handleComplete = async () => {
    setLoading(true)
    setError(null)
    const result = await completeTask(task.id)
    setLoading(false)

    if (result.success) {
      onTaskUpdated()
    } else {
      setError(result.error)
    }
  }

  const formattedDueDate = task.due_date
    ? new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const isOverdue =
    task.due_date &&
    task.status !== 'completed' &&
    task.status !== 'cancelled' &&
    new Date(task.due_date + 'T23:59:59') < new Date()

  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-gray-900">{task.title}</p>
            {getPriorityBadge(task.priority)}
            {getStatusBadge(task.status)}
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {getCategoryLabel(task.category)}
            </span>

            {formattedDueDate && (
              <span
                className={`inline-flex items-center gap-1 ${
                  isOverdue ? 'font-medium text-red-600' : ''
                }`}
              >
                <Calendar className="h-3 w-3" />
                {isOverdue ? 'Overdue: ' : 'Due: '}
                {formattedDueDate}
              </span>
            )}

            {task.assigned_to_name && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assigned_to_name}
              </span>
            )}

            {task.patient_name && (
              <span className="text-gray-400">
                Patient: {task.patient_name}
              </span>
            )}
          </div>

          {error && (
            <p className="mt-1 text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {canComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleComplete}
              disabled={loading}
              className="h-8 text-xs"
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5 text-emerald-600" />
              {loading ? 'Completing...' : 'Complete'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

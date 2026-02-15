'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { TaskFilter } from '@/components/staff/tasks/task-filter'
import { TaskCard } from '@/components/staff/tasks/task-card'
import { getStaffTasks, createTask } from '@/lib/actions/staff'
import type { StaffTaskWithDetails, TaskFilters } from '@/types/staff'
import type { TaskCreateData } from '@/lib/validations/staff'

// ============================================
// Types
// ============================================

interface TaskListProps {
  initialData: StaffTaskWithDetails[]
}

// ============================================
// TaskList
// ============================================

export function TaskList({ initialData }: TaskListProps) {
  const [tasks, setTasks] = useState<StaffTaskWithDetails[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<TaskFilters>({})

  // Create task dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCreateData['category']>('general')
  const [newPriority, setNewPriority] = useState<TaskCreateData['priority']>('normal')
  const [newDueDate, setNewDueDate] = useState('')

  const loadData = useCallback(async (filters: TaskFilters) => {
    setLoading(true)
    setCurrentFilters(filters)
    const result = await getStaffTasks(filters)
    if (result.success) {
      setTasks(result.data)
    }
    setLoading(false)
  }, [])

  const handleFilterChange = useCallback((filters: TaskFilters) => {
    loadData(filters)
  }, [loadData])

  const handleTaskUpdated = useCallback(() => {
    loadData(currentFilters)
  }, [loadData, currentFilters])

  const handleCreateTask = async () => {
    setCreateLoading(true)
    setCreateError(null)

    const result = await createTask({
      title: newTitle,
      description: newDescription || null,
      category: newCategory,
      priority: newPriority,
      due_date: newDueDate || null,
    })

    setCreateLoading(false)

    if (result.success) {
      setCreateOpen(false)
      setNewTitle('')
      setNewDescription('')
      setNewCategory('general')
      setNewPriority('normal')
      setNewDueDate('')
      loadData(currentFilters)
    } else {
      setCreateError(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <TaskFilter onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
              <CardDescription>Manage and track staff workflow tasks</CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to the staff workflow.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title" required>
                      Title
                    </Label>
                    <Input
                      id="task-title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter task title..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Optional description..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="task-create-category">Category</Label>
                      <Select
                        id="task-create-category"
                        value={newCategory}
                        onChange={(e) =>
                          setNewCategory(
                            e.target.value as TaskCreateData['category']
                          )
                        }
                        className="mt-1"
                      >
                        <option value="general">General</option>
                        <option value="insurance_verification">Insurance Verification</option>
                        <option value="follow_up_scheduling">Follow-up Scheduling</option>
                        <option value="document_request">Document Request</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-create-priority">Priority</Label>
                      <Select
                        id="task-create-priority"
                        value={newPriority}
                        onChange={(e) =>
                          setNewPriority(
                            e.target.value as TaskCreateData['priority']
                          )
                        }
                        className="mt-1"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="task-due-date">Due Date</Label>
                      <Input
                        id="task-due-date"
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {createError && (
                    <p className="text-sm text-red-500">{createError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    disabled={createLoading || !newTitle.trim()}
                  >
                    {createLoading ? 'Creating...' : 'Create Task'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">No tasks match the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

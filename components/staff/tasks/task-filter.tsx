'use client'

import { useState, useCallback } from 'react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RotateCcw } from 'lucide-react'
import type { TaskFilters } from '@/types/staff'

// ============================================
// Types
// ============================================

interface TaskFilterProps {
  onFilterChange: (filters: TaskFilters) => void
}

// ============================================
// TaskFilter
// ============================================

export function TaskFilter({ onFilterChange }: TaskFilterProps) {
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleSearch = useCallback(() => {
    onFilterChange({
      category: category || null,
      priority: priority || null,
      status: status || null,
      date_from: dateFrom || null,
      date_to: dateTo || null,
    })
  }, [category, priority, status, dateFrom, dateTo, onFilterChange])

  const handleReset = useCallback(() => {
    setCategory('')
    setPriority('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
    onFilterChange({})
  }, [onFilterChange])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="task-category">Category</Label>
            <Select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1"
            >
              <option value="">All Categories</option>
              <option value="insurance_verification">Insurance Verification</option>
              <option value="follow_up_scheduling">Follow-up Scheduling</option>
              <option value="document_request">Document Request</option>
              <option value="general">General</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="task-priority">Priority</Label>
            <Select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="task-status">Status</Label>
            <Select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="task-date-from">Due From</Label>
            <Input
              id="task-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="task-date-to">Due To</Label>
            <Input
              id="task-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleSearch} size="sm">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

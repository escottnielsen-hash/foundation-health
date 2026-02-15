'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RotateCcw } from 'lucide-react'
import type { SchedulingFilters } from '@/types/staff'

// ============================================
// Types
// ============================================

interface PhysicianOption {
  id: string
  name: string
}

interface LocationOption {
  id: string
  name: string
}

interface SchedulingFilterProps {
  physicians: PhysicianOption[]
  locations: LocationOption[]
  onFilterChange: (filters: SchedulingFilters) => void
}

// ============================================
// SchedulingFilter
// ============================================

export function SchedulingFilter({
  physicians,
  locations,
  onFilterChange,
}: SchedulingFilterProps) {
  const today = new Date().toISOString().split('T')[0]

  const [physicianId, setPhysicianId] = useState('')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [status, setStatus] = useState('')
  const [locationId, setLocationId] = useState('')

  const handleSearch = useCallback(() => {
    onFilterChange({
      physician_id: physicianId || null,
      date_from: dateFrom || null,
      date_to: dateTo || null,
      status: status || null,
      location_id: locationId || null,
    })
  }, [physicianId, dateFrom, dateTo, status, locationId, onFilterChange])

  const handleReset = useCallback(() => {
    setPhysicianId('')
    setDateFrom(today)
    setDateTo(today)
    setStatus('')
    setLocationId('')
    onFilterChange({
      date_from: today,
      date_to: today,
    })
  }, [today, onFilterChange])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="physician-filter">Physician</Label>
            <Select
              id="physician-filter"
              value={physicianId}
              onChange={(e) => setPhysicianId(e.target.value)}
              className="mt-1"
            >
              <option value="">All Physicians</option>
              {physicians.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="date-from">Date From</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="date-to">Date To</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select
              id="status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="location-filter">Location</Label>
            <Select
              id="location-filter"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="mt-1"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
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

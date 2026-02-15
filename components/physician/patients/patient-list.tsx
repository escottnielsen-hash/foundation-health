'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import Link from 'next/link'
import { Search, Calendar, User, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PATIENT_SORT_OPTIONS } from '@/lib/validations/physician-portal'
import type { PhysicianPatientListItem } from '@/lib/actions/physician'

// ============================================
// Types
// ============================================

interface PatientListProps {
  patients: PhysicianPatientListItem[]
}

// ============================================
// Helpers
// ============================================

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return 'No visits'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return formatDate(dateString)
}

function getPatientInitials(firstName: string | null, lastName: string | null): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts
    .map((n) => n?.charAt(0) ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P'
}

// ============================================
// Patient List Component
// ============================================

export function PatientList({ patients }: PatientListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get('q') ?? ''
  const sortBy = searchParams.get('sort') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/physician/patients?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[250px] flex-1">
          <Label htmlFor="patient_search" className="mb-1 block text-xs font-medium text-slate-600">
            Search Patients
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="patient_search"
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="min-w-[180px]">
          <Label htmlFor="patient_sort" className="mb-1 block text-xs font-medium text-slate-600">
            Sort By
          </Label>
          <Select
            id="patient_sort"
            value={sortBy}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="h-9 text-sm"
          >
            <option value="">Default</option>
            {PATIENT_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Patient Cards */}
      {patients.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {searchQuery
                ? 'No patients found matching your search.'
                : 'No patients found. Patients will appear here once you have encounters or appointments.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Card
              key={patient.patient_profile_id}
              className="border shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                    {getPatientInitials(patient.first_name, patient.last_name)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {[patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Unknown'}
                    </p>
                    <p className="truncate text-xs text-slate-500">{patient.email}</p>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Last visit: {formatRelativeDate(patient.last_visit)}
                      </div>
                      {patient.next_appointment && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Calendar className="h-3 w-3" />
                          Next: {formatDate(patient.next_appointment)}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {patient.total_encounters} encounter{patient.total_encounters !== 1 ? 's' : ''}
                      </Badge>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        <Link href={`/physician/patients/${patient.patient_profile_id}`}>
                          View
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPatientDocuments } from '@/lib/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import { RecordsFilter } from '@/components/patient/records-filter'
import { RECORD_TYPES } from '@/lib/validations/patient'
import { format } from 'date-fns'

interface RecordsPageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function HealthRecordsPage({ searchParams }: RecordsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const filters = resolvedParams.type ? { record_type: resolvedParams.type } : undefined
  const result = await getPatientDocuments(user.id, filters)

  if (!result.success) {
    return (
      <div id={elementId('records', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load records
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const records = result.data

  // Helper to get a human-readable record type label
  const getRecordTypeLabel = (type: string): string => {
    const found = RECORD_TYPES.find((rt) => rt.value === type)
    return found ? found.label : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // Helper to get badge variant based on record type
  const getRecordTypeBadgeVariant = (
    type: string
  ): 'default' | 'secondary' | 'outline' | 'success' | 'warning' => {
    switch (type) {
      case 'lab_result':
        return 'success'
      case 'imaging':
        return 'secondary'
      case 'prescription':
        return 'warning'
      case 'diagnosis':
        return 'default'
      default:
        return 'outline'
    }
  }

  const formatRecordDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div id={elementId('records', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('records', 'header')} className="mb-8">
        <h1
          id={elementId('records', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Health Records
        </h1>
        <p
          id={elementId('records', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          View and manage your health documents
        </p>
      </div>

      {/* Filter Bar */}
      <div id={elementId('records', 'toolbar')} className="mb-6 flex items-center justify-between">
        <RecordsFilter />
        <p className="text-sm text-gray-500">
          {records.length} {records.length === 1 ? 'record' : 'records'} found
        </p>
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <Card id={elementId('records', 'empty')}>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No health records found
            </h3>
            <p className="text-gray-500 text-sm">
              {resolvedParams.type
                ? 'No records match the selected filter. Try selecting a different type.'
                : 'Your health records will appear here once added by your care team.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div id={elementId('records', 'list')} className="space-y-3">
          {records.map((record) => (
            <Link
              key={record.id}
              href={`/patient/records/${record.id}`}
              className="block"
            >
              <Card
                id={elementId('records', 'item', record.id)}
                className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Title and metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {record.title}
                        </h3>
                        <Badge variant={getRecordTypeBadgeVariant(record.record_type)}>
                          {getRecordTypeLabel(record.record_type)}
                        </Badge>
                      </div>
                      {record.description && (
                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                          {record.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{formatRecordDate(record.record_date)}</span>
                        {record.physician_name && (
                          <span>Dr. {record.physician_name}</span>
                        )}
                        {record.is_confidential && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            Confidential
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right: Chevron */}
                    <div className="flex-shrink-0 text-gray-300">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

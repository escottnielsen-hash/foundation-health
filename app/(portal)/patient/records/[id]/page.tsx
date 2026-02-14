import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDocumentById } from '@/lib/actions/patient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { RECORD_TYPES } from '@/lib/validations/patient'
import { format } from 'date-fns'

interface RecordDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function HealthRecordDetailPage({
  params,
}: RecordDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const result = await getDocumentById(resolvedParams.id, user.id)

  if (!result.success) {
    notFound()
  }

  const record = result.data

  const getRecordTypeLabel = (type: string): string => {
    const found = RECORD_TYPES.find((rt) => rt.value === type)
    return found ? found.label : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

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

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div id={elementId('record-detail', 'page', 'container')}>
      {/* Back Navigation */}
      <div id={elementId('record-detail', 'back')} className="mb-6">
        <Link href="/patient/records">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Health Records
          </Button>
        </Link>
      </div>

      {/* Document Header */}
      <div id={elementId('record-detail', 'header')} className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {record.title}
          </h1>
          <Badge
            variant={getRecordTypeBadgeVariant(record.record_type)}
            className="mt-1.5"
          >
            {getRecordTypeLabel(record.record_type)}
          </Badge>
          {record.is_confidential && (
            <Badge variant="warning" className="mt-1.5">
              Confidential
            </Badge>
          )}
        </div>
        {record.description && (
          <p className="text-gray-600">{record.description}</p>
        )}
      </div>

      {/* Document Metadata Card */}
      <Card id={elementId('record-detail', 'metadata', 'card')} className="mb-6">
        <CardHeader>
          <CardTitle>Record Details</CardTitle>
          <CardDescription>Metadata about this health record</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetadataField label="Record Date" value={formatDate(record.record_date)} />
            <MetadataField label="Record Type" value={getRecordTypeLabel(record.record_type)} />
            {record.physician_name && (
              <MetadataField label="Provider" value={`Dr. ${record.physician_name}`} />
            )}
            <MetadataField label="Created" value={formatDate(record.created_at)} />
            <MetadataField label="Last Updated" value={formatDate(record.updated_at)} />
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis Codes */}
      {record.icd10_codes && record.icd10_codes.length > 0 && (
        <Card id={elementId('record-detail', 'diagnosis', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Diagnosis Codes (ICD-10)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {record.icd10_codes.map((code) => (
                <Badge key={code} variant="outline">
                  {code}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Procedure Codes */}
      {record.cpt_codes && record.cpt_codes.length > 0 && (
        <Card id={elementId('record-detail', 'procedure', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Procedure Codes (CPT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {record.cpt_codes.map((code) => (
                <Badge key={code} variant="outline">
                  {code}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes / Content */}
      {record.notes && (
        <Card id={elementId('record-detail', 'notes', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {record.notes}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {record.attachments &&
        Array.isArray(record.attachments) &&
        (record.attachments as Array<{ name: string; url: string }>).length > 0 && (
          <Card id={elementId('record-detail', 'attachments', 'card')} className="mb-6">
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(record.attachments as Array<{ name: string; url: string }>).map(
                  (attachment, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-primary-600 hover:underline">
                        {attachment.name}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

// ============================================
// Helper component for metadata fields
// ============================================

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

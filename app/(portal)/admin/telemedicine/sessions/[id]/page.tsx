import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SessionDetailEditor } from '@/components/admin/telemedicine/session-detail-editor'
import { getSessionById } from '@/lib/actions/admin/telemedicine'
import { ArrowLeft } from 'lucide-react'

// ============================================
// Types
// ============================================

interface PageProps {
  params: Promise<{ id: string }>
}

// ============================================
// Session Detail Page (Server)
// ============================================

export default async function TelemedicineSessionDetailPage(props: PageProps) {
  const params = await props.params
  const sessionId = params.id

  const result = await getSessionById(sessionId)

  if (!result.success) {
    notFound()
  }

  const session = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/telemedicine/sessions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Session Detail
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {session.patient_name ?? 'Unknown Patient'} with{' '}
            {session.physician_name ?? 'Unknown Physician'}
          </p>
        </div>
      </div>

      {/* Session Editor */}
      <SessionDetailEditor session={session} />
    </div>
  )
}

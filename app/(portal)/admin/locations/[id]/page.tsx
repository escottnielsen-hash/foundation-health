import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminLocationById } from '@/lib/actions/admin/locations'
import { LocationForm } from '@/components/admin/location-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// ============================================
// Location Edit Page (Server)
// ============================================

interface LocationEditPageProps {
  params: Promise<{ id: string }>
}

export default async function LocationEditPage({ params }: LocationEditPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Handle "new" route for creating a location
  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/locations"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Locations
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Add New Location
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new practice location.
          </p>
        </div>
        <LocationForm mode="create" />
      </div>
    )
  }

  // Editing existing location
  const result = await getAdminLocationById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const location = result.data

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/locations"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Locations
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Edit Location
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update details for <span className="font-medium">{location.name}</span>.
        </p>
      </div>
      <LocationForm location={location} mode="edit" />
    </div>
  )
}

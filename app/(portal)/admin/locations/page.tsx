import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getAdminLocations,
  getLocationProviderCounts,
} from '@/lib/actions/admin/locations'
import { LocationsTable } from '@/components/admin/locations-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

// ============================================
// Locations Management Page (Server)
// ============================================

export default async function AdminLocationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [locationsResult, countsResult] = await Promise.all([
    getAdminLocations(),
    getLocationProviderCounts(),
  ])

  const locations = locationsResult.success ? locationsResult.data : []
  const providerCounts = countsResult.success ? countsResult.data : {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Locations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all practice locations. {locations.length} total location
            {locations.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <Link href="/admin/locations/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Locations Table */}
      <LocationsTable
        locations={locations}
        providerCounts={providerCounts}
      />
    </div>
  )
}

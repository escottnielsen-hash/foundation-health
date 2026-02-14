'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { toggleLocationActive } from '@/lib/actions/admin/locations'
import type { Location } from '@/types/database'
import { Pencil, Power, Loader2 } from 'lucide-react'

// ============================================
// Types
// ============================================

interface LocationsTableProps {
  locations: Location[]
  providerCounts: Record<string, number>
}

// ============================================
// Location type display
// ============================================

function getLocationTypeLabel(type: string): string {
  const map: Record<string, string> = {
    hub: 'Hub',
    spoke: 'Spoke',
    mobile: 'Mobile',
    virtual: 'Virtual',
  }
  return map[type] ?? type
}

function getLocationTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'hub':
      return 'default'
    case 'spoke':
      return 'secondary'
    default:
      return 'outline'
  }
}

// ============================================
// LocationsTable Component
// ============================================

export function LocationsTable({ locations, providerCounts }: LocationsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleToggleActive = (locationId: string, currentName: string) => {
    startTransition(async () => {
      const result = await toggleLocationActive(locationId)
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `"${currentName}" is now ${result.data.is_active ? 'active' : 'inactive'}.`,
          variant: 'success',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  if (locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center">
        <p className="text-sm text-gray-500">No locations found.</p>
        <p className="mt-1 text-xs text-gray-400">
          Click &quot;Add Location&quot; to create your first location.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>City / State</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Providers</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">{location.name}</p>
                  {location.phone && (
                    <p className="text-xs text-gray-400">{location.phone}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getLocationTypeBadgeVariant(location.location_type)}>
                  {getLocationTypeLabel(location.location_type)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {[location.city, location.state].filter(Boolean).join(', ') || '--'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={location.is_active ? 'success' : 'warning'}>
                  {location.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm text-gray-600">
                  {providerCounts[location.id] ?? 0}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/admin/locations/${location.id}`}>
                    <Button variant="ghost" size="icon" title="Edit location">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={location.is_active ? 'Deactivate' : 'Activate'}
                    onClick={() => handleToggleActive(location.id, location.name)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

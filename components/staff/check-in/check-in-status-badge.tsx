import { Badge } from '@/components/ui/badge'

// ============================================
// CheckInStatusBadge
// ============================================

interface CheckInStatusBadgeProps {
  status: string
}

export function CheckInStatusBadge({ status }: CheckInStatusBadgeProps) {
  switch (status) {
    case 'scheduled':
      return <Badge variant="outline">Awaiting Check-In</Badge>
    case 'confirmed':
      return <Badge variant="success">Confirmed - Ready</Badge>
    case 'in_progress':
      return <Badge className="border-transparent bg-blue-100 text-blue-800">Checked In</Badge>
    case 'completed':
      return <Badge variant="secondary">Visit Complete</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    case 'no_show':
      return <Badge variant="warning">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

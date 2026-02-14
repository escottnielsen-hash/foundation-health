'use client'

import { Badge } from '@/components/ui/badge'
import { VERIFICATION_STATUS_CONFIG } from '@/lib/validations/insurance'
import type { VerificationStatus } from '@/types/database'

interface VerificationStatusBadgeProps {
  status: VerificationStatus
  className?: string
}

export function VerificationStatusBadge({ status, className }: VerificationStatusBadgeProps) {
  const config = VERIFICATION_STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'outline' as const,
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

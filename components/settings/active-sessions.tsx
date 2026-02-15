'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Monitor } from 'lucide-react'
import { btnId, elementId } from '@/lib/utils/element-ids'

// ============================================
// Active Sessions Display
// ============================================

interface ActiveSessionsProps {
  userEmail: string
}

export function ActiveSessions({ userEmail }: ActiveSessionsProps) {
  return (
    <Card id={elementId('settings', 'sessions', 'card')}>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active login sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Session */}
        <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
            <Monitor className="h-5 w-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900">
                Current Session
              </p>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {userEmail}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              This is your current browser session
            </p>
          </div>
        </div>

        {/* Sign out other sessions placeholder */}
        <div className="pt-2">
          <Button
            id={btnId('signout', 'other-sessions')}
            variant="outline"
            size="sm"
            disabled
          >
            Sign Out Other Sessions
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Session management across devices will be available in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

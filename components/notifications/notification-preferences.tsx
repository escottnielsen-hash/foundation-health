'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { elementId } from '@/lib/utils/element-ids'
import { NOTIFICATION_TYPES } from '@/lib/validations/notifications'

// ============================================
// Types
// ============================================

interface NotificationPreferences {
  enabledTypes: Record<string, boolean>
  priorityThreshold: 'all' | 'normal' | 'high' | 'urgent'
}

// ============================================
// Storage key
// ============================================

const STORAGE_KEY = 'foundation-health-notification-preferences'

// ============================================
// Default preferences
// ============================================

function getDefaultPreferences(): NotificationPreferences {
  const enabledTypes: Record<string, boolean> = {}
  for (const type of NOTIFICATION_TYPES) {
    enabledTypes[type.value] = true
  }
  return {
    enabledTypes,
    priorityThreshold: 'all',
  }
}

// ============================================
// Load / save helpers
// ============================================

function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences()
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as NotificationPreferences
      // Ensure all types exist (in case new ones were added)
      const defaults = getDefaultPreferences()
      for (const key of Object.keys(defaults.enabledTypes)) {
        if (parsed.enabledTypes[key] === undefined) {
          parsed.enabledTypes[key] = true
        }
      }
      return parsed
    }
  } catch {
    // Ignore parse errors
  }
  return getDefaultPreferences()
}

function savePreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore write errors
  }
}

// ============================================
// Priority options
// ============================================

const PRIORITY_OPTIONS = [
  {
    value: 'all' as const,
    label: 'All notifications',
    description: 'Receive notifications of every priority level',
  },
  {
    value: 'normal' as const,
    label: 'Normal and above',
    description: 'Skip low-priority notifications',
  },
  {
    value: 'high' as const,
    label: 'High and above',
    description: 'Only high-priority and urgent notifications',
  },
  {
    value: 'urgent' as const,
    label: 'Urgent only',
    description: 'Only the most critical notifications',
  },
]

// ============================================
// NotificationPreferences component
// ============================================

export function NotificationPreferences() {
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<NotificationPreferences>(getDefaultPreferences)
  const [hasChanges, setHasChanges] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    const loaded = loadPreferences()
    setPreferences(loaded)
  }, [])

  // Handle type toggle
  const handleTypeToggle = useCallback((typeValue: string) => {
    setPreferences((prev) => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [typeValue]: !prev.enabledTypes[typeValue],
      },
    }))
    setHasChanges(true)
  }, [])

  // Handle priority threshold change
  const handlePriorityChange = useCallback((value: NotificationPreferences['priorityThreshold']) => {
    setPreferences((prev) => ({
      ...prev,
      priorityThreshold: value,
    }))
    setHasChanges(true)
  }, [])

  // Save preferences
  const handleSave = useCallback(() => {
    savePreferences(preferences)
    setHasChanges(false)
    toast({
      title: 'Preferences saved',
      description: 'Your notification preferences have been updated.',
      variant: 'success',
    })
  }, [preferences, toast])

  // Reset to defaults
  const handleReset = useCallback(() => {
    const defaults = getDefaultPreferences()
    setPreferences(defaults)
    savePreferences(defaults)
    setHasChanges(false)
    toast({
      title: 'Preferences reset',
      description: 'Notification preferences have been reset to defaults.',
    })
  }, [toast])

  return (
    <div id={elementId('notification-preferences')} className="space-y-6">
      {/* Notification types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFICATION_TYPES.map((type) => (
            <div
              key={type.value}
              className="flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <Label
                  htmlFor={elementId('notification-preferences', 'type', type.value)}
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {type.label}
                </Label>
                <p className="text-xs text-gray-500">
                  {getTypeDescription(type.value)}
                </p>
              </div>
              <Switch
                id={elementId('notification-preferences', 'type', type.value)}
                checked={preferences.enabledTypes[type.value] ?? true}
                onCheckedChange={() => handleTypeToggle(type.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Priority threshold */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Threshold</CardTitle>
          <CardDescription>
            Set the minimum priority level for notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PRIORITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="priority-threshold"
                value={option.value}
                checked={preferences.priorityThreshold === option.value}
                onChange={() => handlePriorityChange(option.value)}
                className="mt-0.5 h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <Save className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Helper: type descriptions
// ============================================

function getTypeDescription(type: string): string {
  switch (type) {
    case 'appointment':
      return 'Appointment reminders, confirmations, and updates'
    case 'claim':
      return 'Insurance claim status changes and updates'
    case 'insurance':
      return 'Insurance verification and coverage notifications'
    case 'telemedicine':
      return 'Telemedicine session invites and reminders'
    case 'billing':
      return 'Invoice, payment, and billing notifications'
    case 'system':
      return 'System announcements and maintenance alerts'
    case 'message':
      return 'Direct messages from your care team'
    default:
      return 'General notifications'
  }
}

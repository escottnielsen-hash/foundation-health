'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import type { UserPreferences } from '@/types/settings'
import { DEFAULT_PREFERENCES } from '@/types/settings'
import { formId, inputId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Common timezones
// ============================================

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Phoenix',
  'America/Indiana/Indianapolis',
  'America/Detroit',
  'America/Boise',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const

// ============================================
// LocalStorage key
// ============================================

const PREFERENCES_KEY = 'foundation-health-preferences'

function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY)
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_PREFERENCES
}

function savePreferencesToStorage(prefs: UserPreferences) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
  } catch {
    // ignore storage errors
  }
}

// ============================================
// Preferences Form
// ============================================

export function PreferencesForm() {
  const { toast } = useToast()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPreferences(loadPreferences())
    setMounted(true)
  }, [])

  const handleSave = () => {
    savePreferencesToStorage(preferences)
    toast({
      title: 'Preferences saved',
      description: 'Your display preferences have been updated.',
      variant: 'success',
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <form
      id={formId('preferences')}
      onSubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
      className="space-y-6"
    >
      {/* Date Format */}
      <div className="space-y-2">
        <Label htmlFor={inputId('date-format')}>Date Format</Label>
        <Select
          id={inputId('date-format')}
          value={preferences.date_format}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              date_format: e.target.value as UserPreferences['date_format'],
            }))
          }
        >
          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
        </Select>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor={inputId('timezone')}>Timezone</Label>
        <Select
          id={inputId('timezone')}
          value={preferences.timezone}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              timezone: e.target.value,
            }))
          }
        >
          {TIMEZONES.map((tz) => (
            <SelectItem key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label htmlFor={inputId('theme')}>Theme</Label>
        <Select
          id={inputId('theme')}
          value={preferences.theme}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              theme: e.target.value as UserPreferences['theme'],
            }))
          }
        >
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </Select>
        <p className="text-xs text-gray-400">
          Theme switching will take effect in a future update.
        </p>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Communication Preferences
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor={inputId('email-notifications')}>
              Email Notifications
            </Label>
            <p className="text-xs text-gray-400">
              Receive appointment reminders and updates via email
            </p>
          </div>
          <Switch
            id={inputId('email-notifications')}
            checked={preferences.email_notifications}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({
                ...prev,
                email_notifications: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor={inputId('sms-notifications')}>
              SMS Notifications
            </Label>
            <p className="text-xs text-gray-400">
              Receive text message alerts (placeholder)
            </p>
          </div>
          <Switch
            id={inputId('sms-notifications')}
            checked={preferences.sms_notifications}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({
                ...prev,
                sms_notifications: checked,
              }))
            }
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          id={btnId('save', 'preferences')}
          type="submit"
        >
          Save Preferences
        </Button>
      </div>
    </form>
  )
}

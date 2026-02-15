'use client'

import { useState, useTransition, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { changePassword } from '@/lib/actions/settings'
import { formId, inputId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Password strength indicator
// ============================================

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
  if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-500' }
  return { score, label: 'Strong', color: 'bg-emerald-500' }
}

// ============================================
// Password Change Form
// ============================================

export function PasswordChangeForm() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formValues, setFormValues] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const strength = useMemo(
    () => getPasswordStrength(formValues.new_password),
    [formValues.new_password]
  )

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    startTransition(async () => {
      const result = await changePassword(
        formValues.current_password,
        formValues.new_password,
        formValues.confirm_password
      )

      if (result.success) {
        toast({
          title: 'Password changed',
          description: 'Your password has been updated successfully.',
          variant: 'success',
        })
        setFormValues({
          current_password: '',
          new_password: '',
          confirm_password: '',
        })
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
        toast({
          title: 'Password change failed',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <form id={formId('password-change')} onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor={inputId('current-password')} required>
              Current Password
            </Label>
            <Input
              id={inputId('current-password')}
              type="password"
              value={formValues.current_password}
              onChange={(e) => handleChange('current_password', e.target.value)}
              placeholder="Enter current password"
              error={fieldErrors.current_password}
              disabled={isPending}
              autoComplete="current-password"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor={inputId('new-password')} required>
              New Password
            </Label>
            <Input
              id={inputId('new-password')}
              type="password"
              value={formValues.new_password}
              onChange={(e) => handleChange('new_password', e.target.value)}
              placeholder="Enter new password"
              error={fieldErrors.new_password}
              disabled={isPending}
              autoComplete="new-password"
            />
            {/* Strength Indicator */}
            {formValues.new_password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= strength.score ? strength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Password strength: {strength.label}
                </p>
              </div>
            )}
            <ul className="text-xs text-gray-500 space-y-0.5 mt-1">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor={inputId('confirm-password')} required>
              Confirm New Password
            </Label>
            <Input
              id={inputId('confirm-password')}
              type="password"
              value={formValues.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              placeholder="Confirm new password"
              error={fieldErrors.confirm_password}
              disabled={isPending}
              autoComplete="new-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button
            id={btnId('change', 'password')}
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

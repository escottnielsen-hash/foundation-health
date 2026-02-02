'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { formId, inputId, btnId } from '@/lib/utils/element-ids'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <Card id="forgot-password-success-card" className="w-full">
        <CardHeader id="forgot-password-success-header" className="text-center">
          <div id="forgot-password-success-icon" className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle id="forgot-password-success-title">Check your email</CardTitle>
          <CardDescription id="forgot-password-success-subtitle">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <Button
            id={btnId('forgot-password', 'retry')}
            variant="outline"
            onClick={() => setSent(false)}
          >
            Try again
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/login" className="text-sm text-primary-600 hover:text-primary-700">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card id="forgot-password-card" className="w-full">
      <CardHeader id="forgot-password-header" className="text-center">
        <div id="forgot-password-logo" className="mx-auto mb-4">
          <span className="text-2xl font-bold text-primary-600">Foundation Health</span>
        </div>
        <CardTitle id="forgot-password-title">Forgot your password?</CardTitle>
        <CardDescription id="forgot-password-subtitle">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id={formId('forgot-password')} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div id="forgot-password-error" className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div id="forgot-password-email-field" className="space-y-2">
            <label htmlFor={inputId('email')} className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id={inputId('email')}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            id={btnId('forgot-password', 'submit')}
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </CardContent>

      <CardFooter id="forgot-password-footer" className="justify-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

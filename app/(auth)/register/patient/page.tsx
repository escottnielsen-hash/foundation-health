'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { formId, inputId, btnId } from '@/lib/utils/element-ids'

export default function PatientRegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [hipaaConsent, setHipaaConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (!hipaaConsent) {
      setError('You must acknowledge the HIPAA Notice of Privacy Practices')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'patient',
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: 'patient',
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || null,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError(`Database error: ${profileError.message}`)
        setLoading(false)
        return
      }

      // Create patient profile
      const { error: patientError } = await supabase
        .from('patient_profiles')
        .insert({
          user_id: authData.user.id,
        })

      if (patientError) {
        console.error('Patient profile error:', patientError)
      }
    }

    router.push('/login?message=Check your email to verify your account')
  }

  return (
    <Card id="register-patient-card" className="w-full">
      <CardHeader id="register-patient-header" className="text-center">
        <div id="register-patient-logo" className="mx-auto mb-4">
          <span className="text-2xl font-bold text-primary-600">Foundation Health</span>
        </div>
        <CardTitle id="register-patient-title">Create your account</CardTitle>
        <CardDescription id="register-patient-subtitle">
          Join Foundation Health to manage your wellness
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id={formId('register-patient')} onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div id="register-patient-error" className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div id="register-patient-name-fields" className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={inputId('first-name')} className="text-sm font-medium text-gray-700">
                First name
              </label>
              <Input
                id={inputId('first-name')}
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={inputId('last-name')} className="text-sm font-medium text-gray-700">
                Last name
              </label>
              <Input
                id={inputId('last-name')}
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div id="register-patient-email-field" className="space-y-2">
            <label htmlFor={inputId('email')} className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id={inputId('email')}
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div id="register-patient-phone-field" className="space-y-2">
            <label htmlFor={inputId('phone')} className="text-sm font-medium text-gray-700">
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <Input
              id={inputId('phone')}
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div id="register-patient-password-field" className="space-y-2">
            <label htmlFor={inputId('password')} className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id={inputId('password')}
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div id="register-patient-confirm-password-field" className="space-y-2">
            <label htmlFor={inputId('confirm-password')} className="text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <Input
              id={inputId('confirm-password')}
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div id="register-patient-hipaa-consent" className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <input
                id="hipaa-consent"
                type="checkbox"
                checked={hipaaConsent}
                onChange={(e) => setHipaaConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                required
              />
              <label htmlFor="hipaa-consent" className="ml-3 text-sm text-gray-700">
                I acknowledge that I have received and reviewed the{' '}
                <Link href="/hipaa-notice" className="text-primary-600 hover:text-primary-700 underline">
                  HIPAA Notice of Privacy Practices
                </Link>{' '}
                and consent to the collection, use, and disclosure of my health information as described.
              </label>
            </div>
          </div>

          <Button
            id={btnId('register', 'patient-submit')}
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>

          <p id="register-patient-terms" className="text-xs text-center text-gray-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </Link>
          </p>
        </form>
      </CardContent>

      <CardFooter id="register-patient-footer" className="flex-col space-y-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
        <div className="w-full border-t border-gray-200 pt-4">
          <p className="text-sm text-center text-gray-600">
            Are you a healthcare provider?{' '}
            <Link href="/register/physician" className="text-primary-600 hover:text-primary-700 font-medium">
              Register as physician
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

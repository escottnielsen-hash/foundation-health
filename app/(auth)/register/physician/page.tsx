'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { formId, inputId, btnId } from '@/lib/utils/element-ids'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
  'Pediatrics',
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedic Surgery',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Other'
]

export default function PhysicianRegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    npiNumber: '',
    licenseNumber: '',
    licenseState: '',
    specialty: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateNPI = (npi: string): boolean => {
    // NPI is exactly 10 digits
    return /^\d{10}$/.test(npi)
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

    if (!validateNPI(formData.npiNumber)) {
      setError('NPI must be exactly 10 digits')
      setLoading(false)
      return
    }

    if (!formData.licenseState || !formData.specialty) {
      setError('Please select your license state and specialty')
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
          role: 'physician',
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
          role: 'physician',
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      // Create physician profile
      const { error: physicianError } = await supabase
        .from('physician_profiles')
        .insert({
          id: authData.user.id,
          npi_number: formData.npiNumber,
          license_number: formData.licenseNumber,
          license_state: formData.licenseState,
          license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Placeholder
          specialty: formData.specialty,
          verification_status: 'pending',
        })

      if (physicianError) {
        console.error('Physician profile error:', physicianError)
      }
    }

    router.push('/login?message=Check your email to verify your account. Your credentials will be reviewed within 24-48 hours.')
  }

  return (
    <Card id="register-physician-card" className="w-full max-w-lg">
      <CardHeader id="register-physician-header" className="text-center">
        <div id="register-physician-logo" className="mx-auto mb-4">
          <span className="text-2xl font-bold text-primary-600">Foundation Health</span>
        </div>
        <CardTitle id="register-physician-title">Physician Registration</CardTitle>
        <CardDescription id="register-physician-subtitle">
          Join our network of healthcare providers
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div id="register-physician-notice" className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Verification Required:</strong> Your NPI and license credentials will be verified before your account is activated. This typically takes 24-48 hours.
          </p>
        </div>

        <form id={formId('register-physician')} onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div id="register-physician-error" className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div id="register-physician-name-fields" className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={inputId('first-name')} className="text-sm font-medium text-gray-700">
                First name
              </label>
              <Input
                id={inputId('first-name')}
                name="firstName"
                placeholder="Jane"
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
                placeholder="Smith"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div id="register-physician-email-field" className="space-y-2">
            <label htmlFor={inputId('email')} className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id={inputId('email')}
              name="email"
              type="email"
              placeholder="doctor@practice.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div id="register-physician-npi-field" className="space-y-2">
            <label htmlFor={inputId('npi')} className="text-sm font-medium text-gray-700">
              NPI Number
            </label>
            <Input
              id={inputId('npi')}
              name="npiNumber"
              placeholder="1234567890"
              value={formData.npiNumber}
              onChange={handleChange}
              maxLength={10}
              required
            />
            <p className="text-xs text-gray-500">Your 10-digit National Provider Identifier</p>
          </div>

          <div id="register-physician-license-fields" className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor={inputId('license-number')} className="text-sm font-medium text-gray-700">
                License Number
              </label>
              <Input
                id={inputId('license-number')}
                name="licenseNumber"
                placeholder="MD12345"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={inputId('license-state')} className="text-sm font-medium text-gray-700">
                License State
              </label>
              <select
                id={inputId('license-state')}
                name="licenseState"
                value={formData.licenseState}
                onChange={handleChange}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select state</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div id="register-physician-specialty-field" className="space-y-2">
            <label htmlFor={inputId('specialty')} className="text-sm font-medium text-gray-700">
              Specialty
            </label>
            <select
              id={inputId('specialty')}
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select specialty</option>
              {SPECIALTIES.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          <div id="register-physician-password-field" className="space-y-2">
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

          <div id="register-physician-confirm-password-field" className="space-y-2">
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

          <Button
            id={btnId('register', 'physician-submit')}
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit for verification'}
          </Button>

          <p id="register-physician-terms" className="text-xs text-center text-gray-500">
            By registering, you agree to our{' '}
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

      <CardFooter id="register-physician-footer" className="flex-col space-y-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
        <div className="w-full border-t border-gray-200 pt-4">
          <p className="text-sm text-center text-gray-600">
            Not a healthcare provider?{' '}
            <Link href="/register/patient" className="text-primary-600 hover:text-primary-700 font-medium">
              Register as patient
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

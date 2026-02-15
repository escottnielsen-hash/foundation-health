'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updatePhysicianProfile } from '@/lib/actions/physician-clinical'
import type { Profile, PhysicianProfile } from '@/types/database'
import { Save, Loader2, Check, User } from 'lucide-react'

interface PhysicianProfileFormProps {
  profile: Profile
  physicianProfile: PhysicianProfile | null
}

export function PhysicianProfileForm({ profile, physicianProfile }: PhysicianProfileFormProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [bio, setBio] = useState(physicianProfile?.bio ?? '')
  const [languageInput, setLanguageInput] = useState(
    (physicianProfile?.languages ?? []).join(', ')
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const languages = languageInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    const result = await updatePhysicianProfile({
      phone: phone || '',
      bio: bio || '',
      languages,
    })

    if (result.success) {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 3000)
    } else {
      setError(result.error)
    }

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Edit Profile</CardTitle>
        </div>
        <CardDescription>
          Update your contact information and professional bio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
              placeholder="Write a brief professional bio..."
              maxLength={2000}
            />
            <p className="text-xs text-gray-500">{bio.length}/2000 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (comma-separated)</Label>
            <Input
              id="languages"
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              placeholder="English, Spanish, French"
            />
            <p className="text-xs text-gray-500">Separate multiple languages with commas</p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
            </Button>

            {saved && (
              <Badge variant="success" className="gap-1.5">
                <Check className="h-3 w-3" />
                Profile updated
              </Badge>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

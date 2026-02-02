import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'
  const next = redirect.startsWith('/') ? redirect : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has a profile, if not create one
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // Create profile from OAuth metadata
          const metadata = user.user_metadata
          await supabase.from('profiles').insert({
            id: user.id,
            role: 'patient', // Default role for OAuth signups
            first_name: metadata?.full_name?.split(' ')[0] || metadata?.name?.split(' ')[0] || 'User',
            last_name: metadata?.full_name?.split(' ').slice(1).join(' ') || metadata?.name?.split(' ').slice(1).join(' ') || '',
            email: user.email || '',
            avatar_url: metadata?.avatar_url || metadata?.picture || null,
          })

          // Create patient profile
          await supabase.from('patient_profiles').insert({
            id: user.id,
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

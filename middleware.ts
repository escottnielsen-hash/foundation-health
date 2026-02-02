import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const publicPaths = ['/', '/login', '/register', '/forgot-password', '/about', '/services', '/pricing', '/contact']
const authPaths = ['/login', '/register', '/forgot-password']
const physicianPaths = ['/physician']
const patientPaths = ['/patient']
const adminPaths = ['/admin']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Allow public paths
  if (publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
    // If logged in user tries to access auth pages, redirect to dashboard
    if (user && authPaths.some(p => path.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Protected routes require authentication
  if (!user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Get user role from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Role-based access control
  if (physicianPaths.some(p => path.startsWith(p)) && role !== 'physician' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (patientPaths.some(p => path.startsWith(p)) && role !== 'patient' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (adminPaths.some(p => path.startsWith(p)) && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

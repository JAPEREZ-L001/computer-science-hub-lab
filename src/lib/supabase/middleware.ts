import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getSupabasePublishableKey, getSupabaseUrl } from '@/src/lib/supabase/env'

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value)
  })
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith('/perfil') || pathname.startsWith('/onboarding')
  const isAdminRoute = pathname.startsWith('/admin')
  // Ojo al ampliar esta lista: `/recuperar` y `/auth/update-password` deben
  // quedar afuera. Al volver del link de recuperación el usuario YA tiene
  // sesión, así que tratarlas como página de auth lo expulsaría a `/` (ver el
  // redirect de más abajo) justo antes de poder cambiar la contraseña.
  const isAuthPage = pathname === '/login' || pathname === '/registro'
  const isAnonymous = user?.is_anonymous === true

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(url)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const redirectResponse = NextResponse.redirect(new URL('/', request.url))
      copyCookies(response, redirectResponse)
      return redirectResponse
    }
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(url)
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  if (isAuthPage && user && !isAnonymous) {
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    copyCookies(response, redirectResponse)
    return redirectResponse
  }

  return response
}

import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { getSupabasePublishableKey, getSupabaseUrl } from '@/src/lib/supabase/env'

/** Pantalla donde el usuario elige su nueva contraseña tras el link de recovery. */
const UPDATE_PASSWORD_PATH = '/auth/update-password'

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/'
  }
  return next
}

const OTP_TYPES: readonly EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]

function parseOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) return null
  return OTP_TYPES.find((t) => t === raw) ?? null
}

function errorRedirect(origin: string, reason: string) {
  const url = new URL(`${origin}/auth/auth-code-error`)
  url.searchParams.set('reason', reason)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = url.origin

  // Supabase agrega estos params cuando el link expiró o ya se usó. Antes se
  // ignoraban y el usuario veía un error genérico sin saber qué pasó.
  const providerError =
    url.searchParams.get('error_description') ?? url.searchParams.get('error')
  if (providerError) {
    return errorRedirect(origin, providerError)
  }

  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = parseOtpType(url.searchParams.get('type'))

  if (!code && !tokenHash) {
    return errorRedirect(origin, 'missing_code')
  }

  // Un link de recovery da sesión, pero la sesión no es el objetivo: el usuario
  // viene a cambiar la contraseña. Ignoramos `next` en ese caso a propósito,
  // porque si no aterriza en /perfil sin forma de cambiarla.
  const next =
    type === 'recovery'
      ? UPDATE_PASSWORD_PATH
      : safeNextPath(url.searchParams.get('next'))

  const redirectResponse = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          redirectResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  // Dos formatos conviven: PKCE manda `code`; las plantillas de email por
  // defecto de Supabase mandan `token_hash` + `type`. Antes solo se manejaba el
  // primero, así que los links de recuperación caían siempre en la pantalla de
  // error.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return errorRedirect(origin, error.message)
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (error) {
      return errorRedirect(origin, error.message)
    }
  } else {
    // Hay token_hash pero el `type` no es uno de los soportados.
    return errorRedirect(origin, 'invalid_type')
  }

  return redirectResponse
}

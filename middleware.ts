import { type NextRequest } from 'next/server'

import { enforceSiteAvailability } from '@/src/lib/site-gate'
import { updateSession } from '@/src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // El apagón del sitio manda sobre cualquier otra regla.
  const closed = enforceSiteAvailability(request)
  if (closed) return closed

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

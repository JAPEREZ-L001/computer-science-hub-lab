import { NextResponse, type NextRequest } from 'next/server'

import {
  BYPASS_COOKIE,
  BYPASS_MAX_AGE_SECONDS,
  BYPASS_QUERY_PARAM,
  MAINTENANCE_PATH,
  getBypassToken,
  isSiteDisabled,
  safeEquals,
} from '@/src/lib/site-mode'

/**
 * Corta el paso cuando el sitio está apagado al público.
 *
 * Devuelve `null` cuando la petición debe seguir su curso normal (sitio
 * encendido, o visita con acceso anticipado válido). Corre antes que la sesión
 * de Supabase a propósito: así el apagón no gasta llamadas a la base ni depende
 * de que las variables de Supabase estén bien configuradas.
 */
export function enforceSiteAvailability(request: NextRequest): NextResponse | null {
  if (!isSiteDisabled()) return null

  const token = getBypassToken()

  // Canje: `/ruta?acceso=TOKEN` deja la cookie y limpia el parámetro de la URL,
  // para que el token no quede en el historial ni en el header `Referer`.
  const provided = request.nextUrl.searchParams.get(BYPASS_QUERY_PARAM)
  if (token && provided && safeEquals(provided, token)) {
    const clean = request.nextUrl.clone()
    clean.searchParams.delete(BYPASS_QUERY_PARAM)

    const response = NextResponse.redirect(clean)
    response.cookies.set(BYPASS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: BYPASS_MAX_AGE_SECONDS,
    })
    return response
  }

  // Visita ya autorizada: pasa como si el sitio estuviera encendido.
  const cookie = request.cookies.get(BYPASS_COOKIE)?.value
  if (token && cookie && safeEquals(cookie, token)) return null

  // Todo lo demás ve la página de mantenimiento. Es un rewrite, no un redirect:
  // la URL original se conserva en la barra y el visitante puede recargar
  // cuando el sitio vuelva. Los rewrites internos no reejecutan el middleware,
  // así que apuntar a `/mantenimiento` desde `/mantenimiento` no crea un bucle.
  const destination = request.nextUrl.clone()
  destination.pathname = MAINTENANCE_PATH
  destination.search = ''

  return NextResponse.rewrite(destination, {
    status: 503,
    headers: {
      // Le dice a buscadores y monitores que esto es temporal, para que no
      // desindexen el sitio mientras dura el apagón.
      'Retry-After': '3600',
      'Cache-Control': 'no-store, must-revalidate',
    },
  })
}

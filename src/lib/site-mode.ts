/**
 * Interruptor de disponibilidad pública del sitio.
 *
 * Permite apagar el sitio entero sin tocar código: basta con poner
 * `SITE_DISABLED=true` en Vercel y redesplegar. Para volver a habilitarlo se
 * quita la variable (o se pone en `false`) y se redespliega de nuevo.
 *
 * Mientras está apagado, toda ruta responde la página de mantenimiento con
 * HTTP 503, salvo que la visita traiga el token de acceso anticipado.
 */

/** Cookie que marca una sesión autorizada a saltarse el apagón. */
export const BYPASS_COOKIE = 'csh_acceso_anticipado'

/** Query param con el que se canjea el token por la cookie: `/?acceso=TOKEN`. */
export const BYPASS_QUERY_PARAM = 'acceso'

/** Ruta que sirve la página de mantenimiento. */
export const MAINTENANCE_PATH = '/mantenimiento'

/** Vigencia de la cookie de bypass: 7 días. */
const BYPASS_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

/**
 * ¿Está el sitio apagado al público?
 *
 * Solo el valor exacto `true` apaga el sitio. Cualquier otra cosa —variable
 * ausente, cadena vacía, `false`, `1`— lo deja encendido: ante un valor
 * ambiguo preferimos el sitio arriba antes que una caída silenciosa.
 */
export function isSiteDisabled(): boolean {
  return process.env.SITE_DISABLED?.trim().toLowerCase() === 'true'
}

/**
 * Token que permite entrar al sitio mientras está apagado.
 *
 * Si no hay token configurado no existe puerta trasera: el apagón es total.
 */
export function getBypassToken(): string | null {
  const value = process.env.SITE_BYPASS_TOKEN?.trim()
  return value ? value : null
}

/**
 * Comparación en tiempo constante.
 *
 * Evita filtrar la longitud del prefijo correcto del token por diferencias de
 * tiempo. El Edge runtime no expone `crypto.timingSafeEqual`, así que se
 * recorren siempre todos los caracteres sin cortar al primer fallo.
 */
export function safeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export { BYPASS_MAX_AGE_SECONDS }

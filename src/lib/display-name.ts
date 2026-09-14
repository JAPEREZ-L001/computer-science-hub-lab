/**
 * Resolución del nombre visible de un usuario.
 *
 * Existía repetida en `mapProfileRow`, en las queries de comunidad y en la UI
 * de mentores, con criterios que ya habían empezado a divergir. Centralizarla
 * evita que un mismo usuario aparezca como "Ana" en un lado y "Miembro" en otro.
 */
export const DISPLAY_NAME_FALLBACK = 'Miembro'

/**
 * El `email` es opcional a propósito: solo se pasa cuando ya se iba a exponer
 * de todos modos (el perfil propio, el directorio de miembros). Para autores de
 * ideas o votantes no se consulta, porque mostrar la parte local del correo de
 * un tercero filtra un dato que esa persona no eligió publicar.
 */
export function resolveDisplayName(source: {
  full_name?: string | null
  email?: string | null
}): string {
  const fullName = source.full_name?.trim()
  if (fullName) return fullName

  const local = source.email?.trim().split('@')[0]
  if (local) return local

  return DISPLAY_NAME_FALLBACK
}

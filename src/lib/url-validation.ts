const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(value: string): boolean {
  return UUID_RE.test(value)
}

export function isSafeUrl(url: string): boolean {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

const HAS_PROTOCOL_RE = /^[a-z][a-z0-9+.-]*:/i

export function sanitizeOptionalUrl(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim()
  if (!trimmed || trimmed === '#') return null
  // La gente suele escribir "linkedin.com/in/usuario" sin protocolo. Sin este
  // anteponer, new URL() lo rechaza y el campo se guarda como null en
  // silencio: el usuario ve "Perfil actualizado" pero el link nunca se guardo.
  const withProtocol = HAS_PROTOCOL_RE.test(trimmed) ? trimmed : `https://${trimmed}`
  if (!isSafeUrl(withProtocol)) return null
  return withProtocol
}

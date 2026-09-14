/**
 * URL pública del sitio (emails de confirmación, redirects).
 * En cliente se prefiere window.location.origin.
 */
export function getPublicSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  console.warn(
    '[site-url] NEXT_PUBLIC_SITE_URL no está configurada. ' +
      'Los emails de confirmación apuntarán a localhost. ' +
      'Configurá esta variable en producción.',
  )
  return 'http://localhost:3000'
}

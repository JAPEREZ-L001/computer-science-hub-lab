import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * Human-readable labels for every route segment.
 * Add new entries here when new routes are created.
 */
const SEGMENT_LABELS: Record<string, string> = {
  nosotros: 'Conócenos',
  comunidad: 'Comunidad',
  tutorias: 'Tutorías',
  documentacion: 'Documentación',
  podcast: 'Podcast & Media',
  investigacion: 'Investigación',
  competencias: 'Competencias',
  ideas: 'Ideas en Votación',
  mentores: 'Mentores',
  beneficios: 'Beneficios',
  eventos: 'Eventos',
  noticias: 'Noticias',
  oportunidades: 'Oportunidades',
  recursos: 'Recursos',
  miembros: 'Directorio',
  perfil: 'Mi Perfil',
  admin: 'Admin',
  sponsors: 'Sponsors',
  registro: 'Registro',
  login: 'Acceder',
  contacto: 'Contacto',
}

export type BreadcrumbItem = {
  label: string
  href?: string
}

/**
 * Build breadcrumb items from a pathname.
 * Optionally append a custom final crumb (e.g. a dynamic title).
 */
export function buildBreadcrumbs(
  pathname: string,
  finalLabel?: string,
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }]

  let path = ''
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`
    const isLast = i === segments.length - 1 && !finalLabel
    const label = SEGMENT_LABELS[segments[i]] ?? segments[i]
    items.push({ label, href: isLast ? undefined : path })
  }

  if (finalLabel) {
    items.push({ label: finalLabel })
  }

  return items
}

interface PageBreadcrumbProps {
  /** Current pathname (from usePathname or params). */
  pathname: string
  /** Optional last breadcrumb label (for dynamic pages like /noticias/[slug]). */
  finalLabel?: string
  /** Override automatic crumbs entirely. */
  items?: BreadcrumbItem[]
  className?: string
}

export function PageBreadcrumb({
  pathname,
  finalLabel,
  items: customItems,
  className = '',
}: PageBreadcrumbProps) {
  const items = customItems ?? buildBreadcrumbs(pathname, finalLabel)

  if (items.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${className}`}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1

        return (
          <span key={idx} className="inline-flex items-center gap-1.5">
            {idx > 0 && (
              <ChevronRight
                className="h-3 w-3 text-white/15 shrink-0"
                aria-hidden
              />
            )}
            {isLast || !item.href ? (
              <span
                className="text-white/70 truncate max-w-[180px]"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-white/30 transition-colors hover:text-white/70 truncate max-w-[180px]"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

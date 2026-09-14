import Link from 'next/link'

import { fetchResearchPublications } from '@/src/lib/supabase/community-queries'

import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ExternalLink } from 'lucide-react'

export default async function InvestigacionPage() {
  const pubs = await fetchResearchPublications()

  return (
    <ComunidadShell
      pathname="/comunidad/investigacion"
      eyebrow="CSH-37 · Investigación"
      title="Publicaciones"
      titleAccent="y líneas de trabajo"
      description="Trabajos asociados al Hub: posters, charlas, borradores y enlaces externos. Sumá el tuyo vía coordinación académica."
    >
      {pubs.length === 0 ? (
        <p className="text-sm text-white/45">No hay publicaciones cargadas.</p>
      ) : (
        <ul className="space-y-4">
          {pubs.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5"
            >
              <h3 className="font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-white/50">
                {[p.authors, p.venue, p.year].filter(Boolean).join(' · ')}
              </p>
              {p.url ? (
                <Link
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
                >
                  Ver más
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </ComunidadShell>
  )
}

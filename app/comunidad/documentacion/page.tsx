import Link from 'next/link'

import { fetchHubDocuments } from '@/src/lib/supabase/community-queries'

import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ExternalLink } from 'lucide-react'

export default async function DocumentacionPage() {
  const docs = await fetchHubDocuments()

  return (
    <ComunidadShell
      pathname="/comunidad/documentacion"
      eyebrow="CSH-35 · Documentación"
      title="Repositorio"
      titleAccent="de guías del Hub"
      description="Material vivo: onboarding, ingeniería, diseño y plantillas. Los enlaces pueden apuntar a Notion, Drive o sitios internos según configuración del equipo."
    >
      {docs.length === 0 ? (
        <p className="text-sm text-white/45">
          No hay documentos publicados aún. Ejecutá la migración <code className="text-white/60">csh_s2_24_community.sql</code> en Supabase para cargar el seed inicial.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                {d.category}
              </span>
              <h3 className="mt-2 font-semibold text-white">{d.title}</h3>
              {d.description ? <p className="mt-2 text-sm text-white/45">{d.description}</p> : null}
              <Link
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
              >
                Abrir recurso
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ComunidadShell>
  )
}

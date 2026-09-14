import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { fetchPublishedEvents } from "@/src/lib/supabase/queries"
import { eventSortKey, formatEventDateEs, isEventPast } from "@/src/lib/event-datetime"

export async function HomeGrowthSections() {
  const events = await fetchPublishedEvents()
  
  // El proximo evento real: el mas cercano que todavia no paso.
  // Sin fallback a events[0] a proposito — mostrar uno ya ocurrido bajo el
  // titulo "Proximo Evento Destacado" es peor que no mostrar la seccion.
  const nextEvent = [...events]
    .filter((e) => !isEventPast(e))
    .sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)))[0]

  if (!nextEvent) {
    return null
  }

  return (
    <section className="bg-[#050505] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
            Comunidad viva
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Lo que está pasando en el Hub
          </h2>
        </div>

        <article className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 transition-all hover:border-white/[0.15]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between z-10">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/80">
                Próximo Evento Destacado
              </p>
              <h3 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{nextEvent.title}</h3>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 flex flex-wrap items-center gap-2">
                <span>{formatEventDateEs(nextEvent.date, "d 'de' MMMM")}</span>
                <span className="opacity-40">·</span>
                <span>{nextEvent.time}</span>
              </p>
              <p className="mt-6 text-sm leading-relaxed text-white/60 font-medium">{nextEvent.description}</p>
            </div>
            <Link
              href="/eventos"
              className="mt-6 lg:mt-0 inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-all hover:scale-105 hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Ver agenda
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  )
}

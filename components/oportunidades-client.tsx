"use client"

import Link from "next/link"
import { ArrowRight, ExternalLink, Building2, Briefcase, HeartHandshake } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContextualSuggestion } from "@/components/contextual-suggestion"
import { useInView } from "@/hooks/use-in-view"
import { MagneticCard } from "@/components/ui/magnetic-card"

import type { OpportunityRow } from "@/src/lib/supabase/queries"

function OportunidadCard({ op, index }: { op: OpportunityRow; index: number }) {
  const { ref, isInView } = useInView({ threshold: 0.15 })

  return (
    <MagneticCard
      ref={ref}
      className={`group flex flex-col md:flex-row md:items-start md:justify-between p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.15] hover:bg-white/[0.04] reveal-up stagger-${(index % 4) + 1} ${isInView ? "visible" : ""} min-w-0 overflow-hidden gap-6`}
      glowColor="rgba(56, 189, 248, 0.15)" // cyan glow
    >
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition-colors group-hover:bg-white/[0.08] shrink-0">
            <Building2 className="h-5 w-5 text-white/50 transition-colors group-hover:text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white truncate transition-colors group-hover:text-white/90">
            {op.organization}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 break-words">
            <Briefcase className="h-3 w-3 shrink-0" />
            {op.type}
          </span>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
          {op.title}
        </p>

        <p className="text-sm leading-relaxed text-white/50 font-medium transition-colors duration-300 group-hover:text-white/70 break-words max-w-3xl line-clamp-3">
          {op.description}
        </p>
      </div>

      <Link
        href={op.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-press shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.06] px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:scale-105 hover:border-white/40 hover:bg-white/[0.1] hover:text-white md:mt-2 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        Ver convocatoria
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </MagneticCard>
  )
}

export function OportunidadesClient({ opportunities }: { opportunities: OpportunityRow[] }) {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <Header />
      <div className="overflow-x-hidden">
      <section className="relative pt-48 pb-20 sm:pt-56 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400/80 text-mask-reveal overflow-visible">
              Crecimiento pre-profesional
            </span>
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-mask-reveal inline-block overflow-visible">Proyectate a</span>
              <br />
              <span className="text-mask-reveal-delay inline-block text-white/40 overflow-visible">
                la industria
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/50 font-medium reveal-up visible" style={{ animationDelay: "0.5s" }}>
              Pasantías, programas trainee, becas y convocatorias hiper-seleccionadas. Este directorio está validado y actualizado constantemente por nuestros organizadores para conectar el talento del Hub con la industria tecnológica global.
            </p>
          </div>
        </div>
      </section>

      <section className="responsive-safe border-t border-white/[0.06] bg-[#050505] py-24 sm:py-32 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 min-w-0">
          <div className="grid gap-6">
            {opportunities.map((op, index) => (
              <OportunidadCard key={op.id} op={op} index={index} />
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center min-w-0 max-w-3xl mx-auto backdrop-blur-md">
            <p className="text-sm font-bold text-white mb-3 break-words">
              ¿Conocés una oportunidad que deberíamos compartir?
            </p>
            <p className="text-xs leading-relaxed text-white/50 font-medium break-words">
              Escribinos directamente al equipo en nuestro Slack u organízanos la llegada del enlace de la vacante. Siempre estamos predispuestos a publicar excelentes propuestas.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-16 bg-[#0D0D0D]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 sm:flex-row sm:items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Mejora tus oportunidades de ser seleccionado
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/perfil"
              className="btn-press group inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:border-white/40 hover:text-white"
            >
              Completar perfil
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/recursos"
              className="btn-press group inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:border-white/40 hover:text-white"
            >
              Consultar recursos
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <ContextualSuggestion
        theme="dark"
        title="Aliados y beneficios"
        suggestions={[
          {
            title: "Beneficios para miembros",
            description: "Créditos de nube (AWS, Azure), mentorías privadas y ventajas exclusivas con sponsors — todo validado desde tu perfil y membresía en la comunidad.",
            href: "/comunidad/beneficios",
            icon: HeartHandshake,
            requiresAuth: true,
          },
        ]}
      />

      <Footer />
      </div>
    </main>
  )
}

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ExternalLink, BookOpen, Code, Cpu, Palette, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useInView } from "@/hooks/use-in-view"
import { MagneticCard } from "@/components/ui/magnetic-card"

import type { ResourceRow } from "@/src/lib/supabase/queries"

type Area = "all" | "computacion" | "diseño" | "profesional"
type Nivel = "all" | "basico" | "intermedio" | "avanzado"

const areas = [
  { id: "all" as Area, label: "Todas las áreas", icon: Filter },
  { id: "computacion" as Area, label: "Computación", icon: Code },
  { id: "diseño" as Area, label: "Diseño", icon: Palette },
  { id: "profesional" as Area, label: "Profesional", icon: Cpu },
]

const niveles = [
  { id: "all" as Nivel, label: "Todos" },
  { id: "basico" as Nivel, label: "Básico" },
  { id: "intermedio" as Nivel, label: "Intermedio" },
  { id: "avanzado" as Nivel, label: "Avanzado" },
]

function normalizeArea(cat: string): Area {
  if (cat === "diseño" || cat === "profesional" || cat === "computacion") return cat
  return "computacion"
}

function primaryNivel(tags: string[]): Nivel {
  const t = tags[0]?.toLowerCase()
  if (t === "basico" || t === "intermedio" || t === "avanzado") return t
  return "basico"
}

function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return "Web"
  }
}

type RecursoUi = {
  id: string
  nombre: string
  descripcion: string
  area: Area
  nivel: Nivel
  fuente: string
  url: string
}

function ResourceCard({ recurso, index }: { recurso: RecursoUi; index: number }) {
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const areaColor: Record<string, string> = {
    computacion: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    diseño: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    profesional: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  }

  const nivelLabel: Record<string, string> = {
    basico: "Básico",
    intermedio: "Intermedio",
    avanzado: "Avanzado",
  }

  return (
    <MagneticCard
      ref={ref}
      className={`group flex flex-col justify-between p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.15] hover:bg-white/[0.04] reveal-scale stagger-${(index % 4) + 1} ${isInView ? "visible" : ""} h-full min-h-[220px]`}
      glowColor="rgba(192, 132, 252, 0.15)" // purple glow for resources
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-white/90">
            {recurso.nombre}
          </h3>
          <Link
            href={recurso.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center justify-center rounded-full bg-white/5 p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white mt-1 border border-white/[0.08]"
            aria-label={`Ir a ${recurso.nombre}`}
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <p className="text-sm leading-relaxed font-medium text-white/50 mb-8 transition-colors duration-300 group-hover:text-white/70 line-clamp-4">
          {recurso.descripcion}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.06] mt-auto">
        <span className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm ${areaColor[recurso.area]}`}>
          {recurso.area}
        </span>
        <span className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
          {nivelLabel[recurso.nivel]}
        </span>
        <span className="inline-flex rounded-full px-1 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 truncate max-w-[100px]">
          {recurso.fuente}
        </span>
      </div>
    </MagneticCard>
  )
}

export function RecursosClient({ resources }: { resources: ResourceRow[] }) {
  const recursos = useMemo(() => {
    return resources.map((r) => {
      const area = normalizeArea(r.category)
      const nivel = primaryNivel(r.tags)
      return {
        id: r.id,
        nombre: r.title,
        descripcion: r.description,
        area,
        nivel,
        fuente: hostLabel(r.url),
        url: r.url,
      } satisfies RecursoUi
    })
  }, [resources])

  const [areaFilter, setAreaFilter] = useState<Area>("all")
  const [nivelFilter, setNivelFilter] = useState<Nivel>("all")

  const filtered = recursos.filter((r) => {
    const areaMatch = areaFilter === "all" || r.area === areaFilter
    const nivelMatch = nivelFilter === "all" || r.nivel === nivelFilter
    return areaMatch && nivelMatch
  })

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <div className="overflow-x-hidden">
      <section className="relative pt-40 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400/80 text-mask-reveal">
              Recursos de aprendizaje
            </span>
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-mask-reveal inline-block">Aprendé a</span>
              <br />
              <span className="text-mask-reveal-delay inline-block text-white/40">
                tu ritmo
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/50 font-medium reveal-up visible" style={{ animationDelay: "0.5s" }}>
              Cursos, colecciones de tutoriales, roadmaps y contenidos gratuitos hiper-curados por los estudiantes avanzados y mentores del Hub. Explora material de alto impacto.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#0A0A0A] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            {/* Pill Nav filter para Áreas */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-2">Filtrar por Área temática</span>
              <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/[0.08] bg-[#050505] p-1.5 shadow-inner">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setAreaFilter(area.id)}
                    className={`btn-press relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${
                      areaFilter === area.id
                        ? "bg-white text-[#0D0D0D] shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        : "text-white/40 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <area.icon className={`h-3.5 w-3.5 ${areaFilter === area.id ? 'opacity-100' : 'opacity-60'}`} />
                    <span className="z-10">{area.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pill Nav filter para Niveles */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-2">Filtrar por Nivel de dificultad</span>
              <div className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#050505] p-1 shadow-inner h-[46px]">
                {niveles.map((nivel) => (
                  <button
                    key={nivel.id}
                    type="button"
                    onClick={() => setNivelFilter(nivel.id)}
                    className={`btn-press h-full px-5 text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-300 rounded-full ${
                      nivelFilter === nivel.id
                        ? "bg-white/[0.15] text-white border border-white/20 shadow-sm"
                        : "text-white/30 hover:text-white/70"
                    }`}
                  >
                    {nivel.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((recurso, index) => (
                <ResourceCard key={recurso.id} recurso={recurso} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-16 text-center max-w-2xl mx-auto backdrop-blur-md">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <BookOpen className="h-8 w-8 text-white/20" />
              </div>
              <p className="text-base font-bold text-white mb-2">
                Sin resultados disponibles
              </p>
              <p className="text-sm text-white/40 mb-6 font-medium">
                Al parecer no contamos con recursos que cumplan con la métrica seleccionada simultáneamente todavía.
              </p>
              <button
                type="button"
                onClick={() => { setAreaFilter("all"); setNivelFilter("all") }}
                className="btn-press rounded-full border border-white/20 bg-white/[0.05] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Resetear Filtros
              </button>
            </div>
          )}

          <div className="mt-16 flex items-center justify-center border-t border-white/[0.06] pt-10">
            <p className="rounded-full border border-white/[0.08] bg-white/[0.02] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
              {filtered.length} recurso{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""} visualizado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-16 bg-[#0D0D0D]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 sm:flex-row sm:items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 max-w-lg">
            ¿Querés aplicar o testear lo aprendido con el equipo del Hub en convocatorias reales?
          </p>
          <Link
            href="/oportunidades"
            className="btn-press group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Ver oportunidades
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <Footer />
      </div>
    </main>
  )
}

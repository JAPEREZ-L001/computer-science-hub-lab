"use client"

import { Users, Flag, Network, Building2 } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const stages = [
  {
    icon: Users,
    number: "01",
    title: "Comunidad educativa",
    description:
      "Espacios donde estudiantes ayudan a otros a comprender materias, preparar exámenes y conectar teoría con práctica.",
  },
  {
    icon: Flag,
    number: "02",
    title: "Comunidad administrativa",
    description:
      "Equipos y comités donde asumís roles, tomás decisiones y aprendés a trabajar en organización real.",
  },
  {
    icon: Network,
    number: "03",
    title: "Comunidad profesional",
    description:
      "Proyectos y conexiones que te acercan a la industria y te ayudan a construir un perfil empleable sólido.",
  },
  {
    icon: Building2,
    number: "04",
    title: "Mesa de ingeniería",
    description:
      "Redes nacionales e internacionales, programas sostenibles y capacidad de proyectar talento más allá de la universidad.",
    upcoming: true,
  },
]

function EcosystemRow({ stage, index, parentVisible }: {
  stage: typeof stages[number] & { upcoming?: boolean }
  index: number
  parentVisible: boolean
}) {
  const isEven = index % 2 === 0

  return (
    <div
      className={`group relative grid items-start gap-8 border-b border-white/[0.08] py-12 last:border-b-0 md:grid-cols-[100px_1fr_1fr] ${
        isEven ? "reveal-left" : "reveal-right"
      } stagger-${index + 1} ${parentVisible ? "visible" : ""}`}
    >
      <div className="relative z-10 flex items-center justify-center">
        <div className={`circle-ping relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:border-white/30 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(255,255,255,0.05)] stagger-${index + 1} ${parentVisible ? "visible" : ""}`}>
          <stage.icon className="h-8 w-8 text-white/40 transition-all duration-500 group-hover:text-white group-hover:scale-110" />
        </div>
      </div>

      <div className="flex flex-col justify-center h-full">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
            Etapa {stage.number}
          </span>
          {stage.upcoming && (
            <span className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
              Próximamente
            </span>
          )}
        </div>
        <h3 className={`text-2xl font-bold transition-transform duration-500 group-hover:translate-x-2 md:text-3xl ${stage.upcoming ? 'text-white/50' : 'text-white'}`}>
          {stage.title}
        </h3>
      </div>

      <div className="flex flex-col justify-center h-full">
        <p className="max-w-md text-sm font-medium leading-relaxed text-white/50 transition-colors duration-500 group-hover:text-white/80">
          {stage.description}
        </p>
      </div>
    </div>
  )
}

export function EcosystemSection() {
  const { ref: headingRef, isInView: headingVisible } = useInView({ threshold: 0.3 })
  const { ref: listRef, isInView: listVisible } = useInView({ threshold: 0.05 })

  return (
    <section id="ecosystem" className="relative overflow-hidden py-20 bg-[#050505]">
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          ref={headingRef}
          className={`mb-16 text-center reveal-scale ${headingVisible ? "visible" : ""}`}
        >
          <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
            El camino
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Evolución del ecosistema
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-white/50">
            De comunidad educativa a mesa formal de ingeniería con identidad
            propia y proyección nacional.
          </p>
        </div>

        <div ref={listRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-[49px] top-0 hidden h-full w-px bg-white/[0.06] md:block" />

          <div className="space-y-0">
            {stages.map((stage, index) => (
              <EcosystemRow
                key={stage.title}
                stage={stage}
                index={index}
                parentVisible={listVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

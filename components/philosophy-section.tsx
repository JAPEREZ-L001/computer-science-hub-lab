"use client"

import Link from "next/link"
import { ArrowRight, Zap, Cog, Compass } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const philosophies = [
  {
    icon: Zap,
    number: "01",
    title: "Disruptiva",
    short: "Soluciones distintas para la experiencia estudiantil.",
    description:
      "Identificamos problemas reales en la experiencia estudiantil y nos atrevemos a proponer soluciones distintas, creativas y viables.",
    accent: "La disrupción provoca innovación.",
  },
  {
    icon: Cog,
    number: "02",
    title: "Operativa",
    short: "De ideas a resultados planificados.",
    description:
      "No nos quedamos en ideas: planificamos, documentamos y evaluamos lo que hacemos para que los proyectos avancen.",
    accent: "Las buenas ideas se convierten en resultados.",
  },
  {
    icon: Compass,
    number: "03",
    title: "Autónoma",
    short: "Autogestión con responsabilidad institucional.",
    description:
      "Ejercemos liderazgo y autogestión responsable dentro del marco institucional, asumiendo la corresponsabilidad por el Hub.",
    accent: "Decisiones informadas, sostenibilidad real.",
  },
]

export function PhilosophySection() {
  const { ref: headingRef, isInView: headingVisible } = useInView({ threshold: 0.2 })
  const { ref: gridRef, isInView: gridVisible } = useInView({ threshold: 0.1 })

  return (
    <section id="philosophy" className="relative py-20 bg-[#0D0D0D]">
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "1px 80px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          ref={headingRef}
          className={`mb-20 max-w-3xl reveal-left ${headingVisible ? "visible" : ""}`}
        >
          <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Nuestra forma de trabajar
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Tres pilares que
            <br />
            <span className="text-white/40">nos definen</span>
          </h2>
        </div>

        {/* Desktop grid view */}
        <div ref={gridRef} className="hidden md:grid gap-px md:grid-cols-3">
          {philosophies.map((item, index) => (
            <div
              key={item.title}
              className={`group relative border-l border-white/[0.08] py-10 pl-10 pr-8 transition-colors duration-500 hover:border-white/30 hover:bg-white/[0.02] reveal-up stagger-${index + 1} ${gridVisible ? "visible" : ""}`}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.4em] text-white/30">
                  {item.number}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#050505] transition-all duration-500 group-hover:scale-110 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                  <item.icon className="h-5 w-5 text-white/30 transition-colors duration-500 group-hover:text-white" />
                </div>
              </div>

              <h3 className="mb-5 text-2xl font-bold text-white transition-transform duration-300 group-hover:translate-x-1">
                {item.title}
              </h3>

              <p className="mb-8 text-sm font-medium leading-relaxed text-white/50">
                {item.description}
              </p>

              <div className="pt-6 border-t border-white/[0.06] mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 transition-all duration-500 group-hover:text-white/60">
                  {item.accent}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile accordion view */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="space-y-4">
            {philosophies.map((item, index) => (
              <AccordionItem
                key={item.title}
                value={item.title}
                className="rounded-3xl border border-white/[0.08] bg-[#050505] px-6 overflow-hidden"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                      <item.icon className="h-4 w-4 text-white/50" />
                    </div>
                    <div className="text-left">
                      <span className="text-base font-bold text-white">{item.title}</span>
                      <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/40 mt-1">{item.short}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm font-medium leading-relaxed text-white/50 pb-5 pt-2">
                  <p className="mb-5">{item.description}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-400/80">
                    {item.accent}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-16 md:mt-24">
          <Link
            href="/nosotros"
            className="group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            Conocer la historia completa
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

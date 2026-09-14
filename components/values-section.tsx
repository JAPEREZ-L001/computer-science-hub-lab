"use client"

import Link from "next/link"
import { Heart, Eye, HandshakeIcon, Award, Cpu, Users, Target, ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const values = [
  {
    icon: Heart,
    title: "Solidaridad activa",
    short: "Cuando una persona avanza, toda la comunidad avanza.",
  },
  {
    icon: Users,
    title: "Respeto y empatía",
    short: "Cualquier persona puede aprender y participar, sin importar su punto de partida.",
  },
  {
    icon: Eye,
    title: "Transparencia",
    short: "Compartimos cómo se toman decisiones y por qué, generando confianza.",
  },
  {
    icon: HandshakeIcon,
    title: "Corresponsabilidad",
    short: "La mejora del campus es tarea de todos; cada rol suma desde sus competencias.",
  },
  {
    icon: Award,
    title: "Excelencia ética",
    short: "Profundidad técnica y coherencia ética: buen código, buenas decisiones.",
  },
  {
    icon: Cpu,
    title: "Rigor e innovación",
    short: "Fundamentos sólidos con capacidad de crear soluciones nuevas para problemas reales.",
  },
  {
    icon: Target,
    title: "Liderazgo social",
    short: "Ingeniería al servicio de las personas y de la comunidad universitaria.",
  },
]

export function ValuesSection() {
  const { ref: headingRef, isInView: headingVisible } = useInView({ threshold: 0.3 })
  const { ref: topGridRef, isInView: topGridVisible } = useInView({ threshold: 0.1 })
  const { ref: bottomGridRef, isInView: bottomGridVisible } = useInView({ threshold: 0.1 })

  return (
    <section id="values" className="relative py-20 bg-[#0D0D0D]">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          ref={headingRef}
          className={`mb-24 flex flex-col gap-6 md:flex-row md:items-end md:justify-between reveal-up ${headingVisible ? "visible" : ""}`}
        >
          <div className="max-w-2xl">
            <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
              Lo que nos define
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Valores en acción
            </h2>
            <p className="mt-4 text-base font-medium text-white/50 max-w-lg">
              Los pilares inquebrantables de nuestra cultura y ecosistema — explora cada valor en su máximo detalle en la página completa.
            </p>
          </div>
          <Link
            href="/nosotros"
            className="group mt-4 md:mt-0 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.03] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-all hover:border-white/40 hover:bg-white/[0.06] hover:text-white shrink-0"
          >
            Conocer nuestra cultura
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Desktop: grid view */}
        <div className="hidden sm:block">
          <div
            ref={topGridRef}
            className="grid gap-px overflow-hidden rounded-t-3xl border-x border-t border-white/[0.08] sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.slice(0, 4).map((value, index) => (
              <div
                key={value.title}
                className={`group relative bg-[#050505] p-10 transition-colors duration-500 hover:bg-white/[0.04] hover:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] reveal-scale stagger-${index + 1} ${topGridVisible ? "visible" : ""}`}
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors duration-500 group-hover:border-white/[0.15] group-hover:bg-white/[0.06]">
                  <value.icon className="h-6 w-6 text-white/30 transition-all duration-500 group-hover:text-white group-hover:scale-110" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-white transition-colors duration-300 group-hover:text-white/90">
                  {value.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-white/70">
                  {value.short}
                </p>
              </div>
            ))}
          </div>

          <div
            ref={bottomGridRef}
            className="mt-px grid gap-px overflow-hidden rounded-b-3xl border-x border-b border-white/[0.08] sm:grid-cols-3"
          >
            {values.slice(4).map((value, index) => (
              <div
                key={value.title}
                className={`group relative bg-[#050505] p-10 transition-colors duration-500 hover:bg-white/[0.04] hover:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] reveal-scale stagger-${index + 3} ${bottomGridVisible ? "visible" : ""}`}
              >
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors duration-500 group-hover:border-white/[0.15] group-hover:bg-white/[0.06]">
                  <value.icon className="h-6 w-6 text-white/30 transition-all duration-500 group-hover:text-white group-hover:scale-110" />
                </div>
                <h3 className="mb-4 text-xl font-bold text-white transition-colors duration-300 group-hover:text-white/90">
                  {value.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-white/70">
                  {value.short}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: accordion */}
        <div className="sm:hidden">
          <Accordion type="single" collapsible className="space-y-4">
            {values.map((value) => (
              <AccordionItem
                key={value.title}
                value={value.title}
                className="rounded-3xl border border-white/[0.08] bg-[#050505] px-6 overflow-hidden"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex items-center gap-4">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                      <value.icon className="h-4 w-4 text-white/50" />
                    </div>
                    <span className="text-base font-bold text-white text-left">{value.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm font-medium leading-relaxed text-white/50 pb-5 pt-2">
                  {value.short}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

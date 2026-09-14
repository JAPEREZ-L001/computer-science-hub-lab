"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const steps = [
  {
    label: "Paso 1",
    shortLabel: "Nosotros",
    title: "Entender qué es el Hub",
    description: "Lee la sección Conócenos para conocer la historia, filosofía, valores y programas de la comunidad.",
    href: "/nosotros",
    cta: "Ir a Conócenos",
  },
  {
    label: "Paso 2",
    shortLabel: "Explorar",
    title: "Descubrir recursos",
    description: "Explora oportunidades laborales, leé artículos y consumí material educativo creado para vos.",
    href: "/oportunidades",
    cta: "Explorar oportunidades",
  },
  {
    label: "Paso 3",
    shortLabel: "Comunidad",
    title: "Ver quiénes somos",
    description: "Conocé al talento del Hub en el directorio y mirá los beneficios que podés desbloquear.",
    href: "/comunidad",
    cta: "Ver comunidad",
  },
  {
    label: "Paso 4",
    shortLabel: "Unirme",
    title: "Dejar tu interés",
    description: "Completá el formulario corto para que podamos contactarte. No es un compromiso formal.",
    href: "/nosotros#join",
    cta: "Completar formulario",
  },
]

export function SitePath() {
  const { ref, isInView } = useInView({ threshold: 0.2 })
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="border-t border-white/[0.06] bg-[#0A0A0A] py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mb-16 max-w-3xl reveal-up ${isInView ? "visible" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Ruta sugerida
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Cómo sumergirte en el Hub
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50 max-w-2xl font-medium">
            No hace falta verlo todo de una vez. Sigue esta secuencia paso a paso para
            entender nuestra visión, decidir y dar tu primer paso concreto hacia el crecimiento.
          </p>
        </div>

        {/* Desktop stepper indicator */}
        <div className="hidden md:flex items-center gap-0 mb-12">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setActiveStep(index)}
                className={`relative flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-300 ${
                  index === activeStep
                    ? "bg-white/[0.08] text-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    : index < activeStep
                    ? "text-white/60 hover:text-white hover:bg-white/[0.02]"
                    : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                    index < activeStep
                      ? "bg-white/20 text-white"
                      : index === activeStep
                      ? "bg-white text-[#0D0D0D] shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "border border-white/20 text-white/40"
                  }`}
                >
                  {index < activeStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-[0.2em]">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`mx-3 h-px flex-1 transition-colors duration-500 ${
                    index < activeStep ? "bg-white/30" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile step indicator - pills with labels (oculto en mobile por solicitud) */}
        <div className="hidden gap-3 mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {steps.map((step, index) => (
            <button
              key={step.label}
              onClick={() => setActiveStep(index)}
              className={`btn-press flex shrink-0 items-center gap-2.5 rounded-full px-5 py-3 transition-all duration-300 min-h-[48px] ${
                index === activeStep
                  ? "bg-white/[0.1] text-white border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  : index < activeStep
                  ? "text-white/60 border border-white/10 bg-white/[0.02] hover:text-white hover:bg-white/[0.05]"
                  : "text-white/40 border border-white/[0.06] bg-white/[0.01] hover:text-white/60 hover:border-white/10"
              }`}
              aria-label={`Ir al paso ${index + 1}: ${step.title}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 ${
                  index < activeStep
                    ? "bg-white/20 text-white"
                    : index === activeStep
                    ? "bg-white text-[#0D0D0D]"
                    : "border border-white/20 text-white/40"
                }`}
              >
                {index < activeStep ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{step.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Active step content */}
        <div
          className={`rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 md:p-12 transition-all duration-700 reveal-scale ${isInView ? "visible" : ""}`}
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
                {steps[activeStep].label}
              </span>
              <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl md:text-4xl leading-tight">
                {steps[activeStep].title}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-white/50 max-w-xl font-medium">
                {steps[activeStep].description}
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0 pt-2">
              <Link
                href={steps[activeStep].href}
                className="btn-press group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                {steps[activeStep].cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="mt-12 flex items-center justify-between border-t border-white/[0.06] pt-8">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="btn-press inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Punto anterior</span>
              <span className="sm:hidden">Anterior</span>
            </button>

            <span className="text-[10px] uppercase font-bold tracking-widest text-white/20">
              {activeStep + 1} / {steps.length}
            </span>

            <button
              onClick={() =>
                setActiveStep(Math.min(steps.length - 1, activeStep + 1))
              }
              disabled={activeStep === steps.length - 1}
              className="btn-press inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Siguiente punto</span>
              <span className="sm:hidden">Siguiente</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

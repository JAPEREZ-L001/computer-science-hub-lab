"use client"

import { useInView } from "@/hooks/use-in-view"
import { BookOpen, Users, Briefcase } from "lucide-react"

const categorias = [
  {
    icon: BookOpen,
    label: "Académico",
    programas: [
      { title: "Tutorías entre pares", description: "Espacios estructurados donde estudiantes acompañan a quienes necesitan refuerzo.", audience: "Estudiantes de Computación" },
      { title: "Grupos de estudio", description: "Sesiones para profundizar en fundamentos de computación y resolver problemas.", audience: "Todos los estudiantes" },
    ],
  },
  {
    icon: Users,
    label: "Organizativo",
    programas: [
      { title: "Comités de trabajo", description: "Estructuras para planificar actividades y sostener el Hub.", audience: "Estudiantes líderes" },
      { title: "Mesas de diálogo", description: "Espacios formales para canalizar inquietudes estudiantiles con autoridades.", audience: "Representantes" },
    ],
  },
  {
    icon: Briefcase,
    label: "Profesional",
    programas: [
      { title: "Paneles con industria", description: "Conversaciones con profesionales del sector tecnológico.", audience: "Estudiantes en general" },
      { title: "Rutas de preparación", description: "Actividades enfocadas en portafolio, CV y entrevistas técnicas.", audience: "Estudiantes avanzados" },
    ],
  },
]

export function NosotrosHero() {
  return (
    <section className="relative pt-48 pb-20 sm:pt-56 sm:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 text-mask-reveal overflow-visible">
            Conócenos
          </span>
          <h1 className="mb-8 text-5xl font-bold tracking-tight text-white leading-[1.15] sm:text-6xl md:text-7xl">
            <span className="text-mask-reveal inline-block overflow-visible pb-0.5">Comunidad que</span>
            <br />
            <span className="text-mask-reveal-delay inline-block text-white/40">
              impulsa futuro
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/50 font-medium reveal-up visible" style={{ animationDelay: "0.5s" }}>
            El Computer Science Hub es la comunidad de estudiantes de
            Ingeniería en Ciencias de la Computación de la Universidad Don
            Bosco que convierte el aula en un laboratorio vivo de aprendizaje,
            organización y proyección profesional.
          </p>
        </div>
      </div>
    </section>
  )
}

export function QuienesSomos() {
  const { ref: leftRef, isInView: leftVisible } = useInView({ threshold: 0.2 })
  const { ref: rightRef, isInView: rightVisible } = useInView({ threshold: 0.2 })

  return (
    <section className="border-t border-white/[0.06] bg-[#050505] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-16 md:grid-cols-[1fr_2fr]">
          <div ref={leftRef} className={`reveal-left flex flex-col justify-start ${leftVisible ? "visible" : ""}`}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">Quiénes somos</h2>
            <div className="mt-8 h-1 w-20 bg-emerald-500/50 rounded-full" />
          </div>
          <div ref={rightRef} className={`grid gap-10 sm:grid-cols-3 reveal-right ${rightVisible ? "visible" : ""}`}>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center p-2 rounded-lg bg-white/[0.05] border border-white/10 text-emerald-400">01</span>
                Fundación
              </h3>
              <p className="text-sm leading-relaxed text-white/50 font-medium">
                Nacimos como un proyecto creado por y para estudiantes. Cuestionamos las prácticas que ya no funcionaban y nos unimos para construir un espacio diferente.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center p-2 rounded-lg bg-white/[0.05] border border-white/10 text-emerald-400">02</span>
                Proceso
              </h3>
              <p className="text-sm leading-relaxed text-white/50 font-medium">
                Hoy combinamos formación académica, organización comunitaria y oportunidades. Llevamos las alternativas a la práctica con rigor técnico y responsabilidad.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="flex items-center justify-center p-2 rounded-lg bg-white/[0.05] border border-white/10 text-emerald-400">03</span>
                Construcción
              </h3>
              <p className="text-sm leading-relaxed text-white/50 font-medium">
                Construimos paso a paso una mesa formal de ingeniería con identidad propia y proyección nacional. El objetivo es que cada estudiante llegue más lejos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProgramasSection() {
  const { ref, isInView } = useInView({ threshold: 0.1 })
  return (
    <section className="border-t border-white/[0.06] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mb-20 text-center md:text-left reveal-up ${isInView ? "visible" : ""}`} ref={ref}>
          <span className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
            Nuestro Enfoque
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">¿Dónde puedo involucrarme?</h2>
          <p className="mt-4 max-w-2xl text-base font-medium text-white/50 mx-auto md:mx-0">Los programas y líneas de acción estratégicas que dan vida al ecosistema del Hub.</p>
        </div>
        
        <div className="space-y-20">
          {categorias.map((cat, index) => (
            <div key={cat.label} className={`reveal-up stagger-${index + 1} ${isInView ? "visible" : ""}`}>
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                  <cat.icon className="h-5 w-5 text-white/50" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">{cat.label}</h3>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {cat.programas.map((prog) => (
                  <div key={prog.title} className="group rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-[0_20px_40px_-20px_rgba(255,255,255,0.05)]">
                    <h4 className="mb-4 text-xl font-bold text-white transition-colors duration-300 group-hover:text-white/90">
                      {prog.title}
                    </h4>
                    <p className="mb-8 text-sm font-medium leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-white/70 min-h-[60px]">
                      {prog.description}
                    </p>
                    <div className="pt-6 border-t border-white/[0.06] mt-auto">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors duration-300 group-hover:text-white/50">
                        Dirigido a: <span className="text-white/50 group-hover:text-white">{prog.audience}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

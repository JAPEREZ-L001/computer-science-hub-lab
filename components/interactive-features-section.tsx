'use client'

import Link from 'next/link'
import { Calendar, GraduationCap, Lightbulb, Users } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Eventos',
    description: 'Inscríbete a workshops, charlas y hackathons exclusivos del Hub.',
    href: '/eventos',
    footnote: 'Calendario actualizado con el equipo',
  },
  {
    icon: Lightbulb,
    title: 'Ideas',
    description: 'Vota las iniciativas que te gustaría ver priorizadas dentro del campus.',
    href: '/comunidad/ideas',
    footnote: 'La comunidad define parte de la agenda',
  },
  {
    icon: GraduationCap,
    title: 'Tutorías',
    description: 'Pide o brinda acompañamiento académico puntual cuando lo necesites.',
    href: '/comunidad/tutorias',
    footnote: 'Match directo con pares de apoyo',
  },
  {
    icon: Users,
    title: 'Mentores',
    description: 'Conéctate con estudiantes que ya recorrieron el camino que estás transitando.',
    href: '/comunidad/mentores',
    footnote: 'Directorio y preferencias de matching',
  },
] as const

export function InteractiveFeaturesSection() {
  return (
    <section
      className="relative border-y border-white/[0.06] bg-[#050505] py-24 sm:py-32 overflow-hidden"
      aria-labelledby="hub-en-accion-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
            Comunidad en acción
          </span>
          <h2
            id="hub-en-accion-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Más que solo código:
            <span className="text-white/40"> conexiones que construyen</span>
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-white/50 font-medium">
            Cuando te unes al Hub, desbloqueas herramientas para colaborar, aprender y crecer aceleradamente — todo respaldado por una red de talento informático de primer nivel.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description, href, footnote }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-[0_20px_40px_-20px_rgba(255,255,255,0.05)]"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                  <Icon className="h-6 w-6 text-white/50 transition-colors group-hover:text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white transition-colors group-hover:text-white/90">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50 font-medium line-clamp-3">{description}</p>
              </div>
              <div className="mt-8 border-t border-white/[0.06] pt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 break-words">{footnote}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'

import { createClient } from '@/src/lib/supabase/server'
import { fetchActiveSponsors } from '@/src/lib/supabase/queries'

import { AuthRequiredBanner } from '@/components/auth-required-banner'
import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ExternalLink } from 'lucide-react'

const staticBenefits = [
  {
    title: 'Sistema de Nivelación',
    body: 'Aprendé de miembros veteranos desde el primer día. Los más avanzados te acompañan en tu roadmap técnico mientras vos aportás energía y perspectiva nueva.',
  },
  {
    title: 'Red de mentores activos',
    body: 'Matching con estudiantes de ciclos avanzados y alumni para guía técnica real: portafolios, proyectos y preparación profesional continua.',
  },
  {
    title: 'Prioridad en eventos y workshops',
    body: 'Cupos reservados y acceso anticipado a todos los talleres del hub: ciberseguridad, IA, UX/UI, Git, Hackathons internos y más.',
  },
  {
    title: 'Repositorio exclusivo del Hub',
    body: 'Accedé al material curado por generaciones anteriores: parciales, apuntes, guías de materias y proyectos que no vas a encontrar en ningún otro lado.',
  },
  {
    title: 'Vínculo con la Dirección de Innovación UDB',
    body: 'Como miembro activo tenés acceso prioritario a charlas, convocatorias de horas sociales y programas de la Dirección de Innovación de la UDB.',
  },
  {
    title: 'Voz en la licitación de ideas',
    body: 'Votá y proponé las próximas iniciativas del hub. Las decisiones sobre eventos, proyectos y dirección del CSH las tomamos entre todos los miembros.',
  },
] as const


export default async function BeneficiosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const authed = Boolean(user && !user.is_anonymous)

  const sponsors = await fetchActiveSponsors()

  return (
    <ComunidadShell
      pathname="/comunidad/beneficios"
      eyebrow="CSH-41 · Afiliación"
      title="Beneficios"
      titleAccent="de ser miembro"
      description="Un resumen de lo que la membresía activa habilita hoy. Los aliados del Hub amplían beneficios concretos (licencias, créditos, mentorías)."
    >
      {!authed ? (
        <div className="mb-10">
          <AuthRequiredBanner
            variant="inline"
            theme="dark"
            title="Registrate para desbloquear todos los beneficios"
            description="Con cuenta real accedés al perfil, tutorías, votación de ideas y detalles completos de aliados."
            loginHref="/login?redirect=/comunidad/beneficios"
            registerHref="/registro?redirect=/comunidad/beneficios"
            loginLabel="Ya tengo cuenta"
            registerLabel="Registrarme"
          />
        </div>
      ) : (
        <div className="mb-10 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-sm font-medium text-emerald-100/90">Ya tenés acceso completo</p>
          <p className="mt-1 text-sm text-white/50">
            Tu espacio de beneficios crece con el tiempo: revisá{' '}
            <Link href="/perfil" className="text-white/80 underline-offset-4 hover:underline">
              tu perfil
            </Link>{' '}
            y las secciones de comunidad.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {staticBenefits.map((b) => (
          <div
            key={b.title}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-5"
          >
            <h3 className="font-semibold text-white">{b.title}</h3>
            <p className="mt-2 text-sm text-white/45">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
          Aliados que suman beneficios
        </h2>
        {sponsors.length === 0 ? (
          <p className="mt-3 text-sm text-white/35">Pronto listamos más aliados.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {sponsors.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"
              >
                <span className="font-medium text-white">{s.name}</span>
                <Link
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-white/50 hover:text-white"
                >
                  Sitio
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ComunidadShell>
  )
}

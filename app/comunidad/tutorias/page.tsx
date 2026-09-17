import Link from 'next/link'

import { createClient } from '@/src/lib/supabase/server'
import {
  fetchTutoringRequestsForMentor,
  fetchTutoringRequestsForUser,
} from '@/src/lib/supabase/community-queries'

import { AuthRequiredBanner } from '@/components/auth-required-banner'
import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ComunidadTabsShell } from '@/components/comunidad/comunidad-tabs-shell'
import { ContextualSuggestion } from '@/components/contextual-suggestion'
import { TutoringRequestForm } from '@/components/comunidad/tutoring-request-form'
import { TutoringMentorList } from '@/components/comunidad/tutoring-mentor-list'
import { TutoringStudentList } from '@/components/comunidad/tutoring-student-list'
import { Users } from 'lucide-react'

export default async function TutoriasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const authed = Boolean(user && !user.is_anonymous)
  // La agenda de mentor se pide siempre que haya sesión: quien no tiene
  // tutorías asignadas recibe [] y no ve la sección.
  const [requests, mentorRequests] =
    authed && user
      ? await Promise.all([
          fetchTutoringRequestsForUser(user.id),
          fetchTutoringRequestsForMentor(user.id),
        ])
      : [[], []]

  return (
    <ComunidadShell
      pathname="/comunidad/tutorias"
      eyebrow="CSH-34 · Tutorías & Mentores"
      title="Apoyo entre"
      titleAccent="pares"
      description="Las solicitudes quedan registradas para que mentores o coordinadores puedan hacer match. Usá las pestañas para navegar entre tutorías y el directorio de mentores."
      beforeFooter={
        <ContextualSuggestion
          theme="dark"
          title="Siguiente paso"
          suggestions={[
            {
              title: 'Mentores & matching',
              description: 'Directorio y preferencias para conectar con quien puede acompañarte.',
              href: '/comunidad/mentores',
              icon: Users,
              requiresAuth: true,
            },
          ]}
        />
      }
    >
      <ComunidadTabsShell>
      {authed ? (
        <div className="mb-8 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-100/90">Ya tenés acceso completo</p>
          <p className="mt-1 text-sm text-white/50">
            Completá el formulario para registrar tu pedido; coordinación y mentores verán el tema y el
            contexto.
          </p>
        </div>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          {authed ? (
            <TutoringRequestForm />
          ) : (
            <AuthRequiredBanner
              variant="empty-state"
              theme="dark"
              title="Creá tu cuenta y pedí ayuda en cualquier tema"
              description="Con una cuenta real enviamos tu solicitud al flujo de tutorías y mentores del Hub."
              loginHref="/login?redirect=/comunidad/tutorias"
              registerHref="/registro?redirect=/comunidad/tutorias"
            />
          )}

          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-5">
            <p className="text-sm text-white/45">
              ¿Querés ofrecer mentoría? Completá tu perfil en{' '}
              <Link href="/comunidad/mentores" className="text-white/80 underline-offset-4 hover:underline">
                Mentores & matching
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">Tus solicitudes</h2>
            {!authed ? (
              <p className="mt-3 text-sm text-white/35">—</p>
            ) : (
              <TutoringStudentList requests={requests} />
            )}
          </div>

          {/* Solo aparece si a esta persona le asignaron tutorías como mentor. */}
          {mentorRequests.length > 0 ? (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
                Tutorías que estás acompañando
              </h2>
              <p className="mt-1 text-xs text-white/35">
                Fijá el aula y el horario para que tu alumno sepa dónde presentarse.
              </p>
              <TutoringMentorList requests={mentorRequests} />
            </div>
          ) : null}
        </div>
      </div>
      </ComunidadTabsShell>
    </ComunidadShell>
  )
}

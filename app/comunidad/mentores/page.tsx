import { createClient } from '@/src/lib/supabase/server'
import {
  fetchMentorDirectory,
  fetchMentorProfileForUser,
} from '@/src/lib/supabase/community-queries'

import { AuthRequiredBanner } from '@/components/auth-required-banner'
import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ComunidadTabsShell } from '@/components/comunidad/comunidad-tabs-shell'
import { MentorMatchingForm } from '@/components/comunidad/mentor-matching-form'

export default async function MentoresPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const authed = Boolean(user && !user.is_anonymous)
  const mentors = authed ? await fetchMentorDirectory() : []
  const own = authed && user ? await fetchMentorProfileForUser(user.id) : null

  const initial =
    own != null
      ? {
          role: own.role,
          topics: own.topics ?? '',
          availability: own.availability ?? '',
          bio_short: own.bio_short ?? '',
          active: own.active,
        }
      : null

  return (
    <ComunidadShell
      pathname="/comunidad/mentores"
      eyebrow="CSH-40 · Matching"
      title="Mentores"
      titleAccent="y preferencias"
      description="Quienes ofrecen mentoría aparecen aquí si tienen perfil activo y son miembros visibles en el directorio. Los estudiantes pueden completar su perfil para facilitar el match."
    >
      <ComunidadTabsShell>
      {authed ? (
        <div className="mb-8 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-100/90">Ya tenés acceso al directorio</p>
          <p className="mt-1 text-sm text-white/50">
            Explorá mentores activos y completá tu perfil de matching para que el equipo pueda
            conectarte mejor.
          </p>
        </div>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            Directorio de mentores
          </h2>
          {!authed ? (
            <div className="mt-4">
              <AuthRequiredBanner
                variant="inline"
                theme="dark"
                title="Conectá con mentores que te pueden ayudar"
                description="Iniciá sesión con una cuenta real para ver el directorio y sus datos de contacto resumidos."
                loginHref="/login?redirect=/comunidad/mentores"
                registerHref="/registro?redirect=/comunidad/mentores"
              />
            </div>
          ) : mentors.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">
              Todavía no hay mentores con perfil activo. Si querés ofrecer mentoría, completá el formulario
              al lado.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {mentors.map((m) => (
                <li
                  key={m.user_id}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 text-sm"
                >
                  <p className="font-medium text-white">{m.display_name ?? 'Miembro'}</p>
                  {m.bio_short ? <p className="mt-2 text-white/50">{m.bio_short}</p> : null}
                  {m.topics ? (
                    <p className="mt-2 text-xs text-white/35">Temas: {m.topics}</p>
                  ) : null}
                  {m.availability ? (
                    <p className="mt-1 text-xs text-white/35">Disponibilidad: {m.availability}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {authed ? (
            <MentorMatchingForm initial={initial} />
          ) : (
            <AuthRequiredBanner
              variant="empty-state"
              theme="dark"
              title="Configurá tu perfil de matching"
              description="Con sesión iniciada podés indicar temas, disponibilidad y si ofrecés mentoría."
              loginHref="/login?redirect=/comunidad/mentores"
              registerHref="/registro?redirect=/comunidad/mentores"
            />
          )}
        </div>
      </div>
      </ComunidadTabsShell>
    </ComunidadShell>
  )
}

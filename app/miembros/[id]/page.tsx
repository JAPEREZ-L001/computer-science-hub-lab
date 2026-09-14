import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { CalendarDays, Github, Linkedin, ArrowRight, Zap } from 'lucide-react'
import { differenceInMonths, format } from 'date-fns'
import { es } from 'date-fns/locale'

import { createClient } from '@/src/lib/supabase/server'
import { fetchProfileByUserId, fetchRelatedMembers } from '@/src/lib/supabase/queries'
import { getAvatarDataUri, getBannerDataUri } from '@/src/lib/avatar-generator'
import { isValidUUID } from '@/src/lib/url-validation'
import type { MemberArea } from '@/src/types'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BadgeGroup } from '@/components/ui/user-badge'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const initials = parts.map((p) => p[0]?.toUpperCase()).join('')
  return initials || 'U'
}

function prettyArea(area: MemberArea) {
  switch (area) {
    case 'frontend': return 'Frontend'
    case 'backend': return 'Backend'
    case 'diseño': return 'Diseño'
    case 'devops': return 'DevOps'
    case 'ia': return 'IA'
    case 'ciberseguridad': return 'Ciberseguridad'
    case 'robótica': return 'Robótica'
    case 'juegos': return 'Desarrollo de Juegos'
    case 'general': return 'General'
  }
}

function formatDateEs(date: string) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Perfil publico de un miembro (visto por otros) -- distinto de /perfil,
 * que siempre es el propio y muestra el dashboard privado (eventos
 * inscritos, ideas propias, tutorias, email personal). Ninguno de esos
 * datos se pide ni se muestra aca a proposito.
 */
export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!isValidUUID(id)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ver el propio perfil por esta ruta redirige al dashboard real.
  if (user && user.id === id) {
    redirect('/perfil')
  }

  const member = await fetchProfileByUserId(id)
  if (!member) notFound()

  const relatedMembers = await fetchRelatedMembers(member.area, member.id, 3)
  const membershipMonths = Math.max(differenceInMonths(new Date(), new Date(member.joinedAt)), 0)
  const avatarDataUri = getAvatarDataUri(member.id, 96, member.avatarPaletteIndex ?? undefined)
  const bannerDataUri = getBannerDataUri(member.id, member.bannerPaletteIndex ?? undefined)

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden pt-10">
      <Header />

      <div className="mx-auto max-w-5xl px-4 pt-24 pb-32 sm:px-6">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.01] overflow-hidden">
          <div className="h-40 w-full relative">
            <img
              src={bannerDataUri}
              alt="Banner de perfil"
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent" />
            <div className="absolute -bottom-12 left-8 rounded-full border-[8px] border-[#0D0D0D]">
              <img
                src={avatarDataUri}
                alt={`Avatar de ${member.name}`}
                className="h-24 w-24 sm:h-28 sm:w-28 rounded-full"
              />
            </div>
          </div>

          <div className="px-4 sm:px-8 pt-20 pb-10 min-w-0 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">{member.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  <span>{member.career}</span>
                  <span className="opacity-40">·</span>
                  <span>Ciclo {member.cycle}</span>
                </div>
              </div>

              <BadgeGroup badge={member.badge} extra={prettyArea(member.area)} size="md" />
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8 md:col-span-2 flex flex-col justify-between">
                <div>
                  <h2 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Biografía
                  </h2>
                  <p className="text-sm leading-relaxed text-white/60 font-medium">
                    {member.bio ?? 'Este miembro todavía no agregó una biografía.'}
                  </p>
                </div>

                <div className="mt-10 border-t border-white/[0.06] pt-8 flex flex-wrap gap-4">
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" className="group inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/5 px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-all hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.08] hover:text-white">
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="group inline-flex flex-1 items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-white/5 px-4 py-3.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-all hover:-translate-y-1 hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {!member.github && !member.linkedin && (
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/20">Sin redes vinculadas</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8 text-center flex-1 flex flex-col justify-center">
                  <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400/80">
                    Reputación
                  </h2>
                  <div className="my-6 text-4xl font-bold text-white">{member.reputationScore}</div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">puntos acumulados</p>
                </div>

                <div className="rounded-3xl border border-emerald-500/10 bg-emerald-500/5 p-6 lg:p-8 text-center">
                  <CalendarDays className="mx-auto mb-4 h-6 w-6 text-emerald-400/50" />
                  <p className="text-sm font-bold text-emerald-400/80 mb-2">{formatDateEs(member.joinedAt)}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/50">
                    {membershipMonths} {membershipMonths === 1 ? 'mes' : 'meses'} en el Hub
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8 min-w-0 overflow-hidden">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6 min-w-0">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 min-w-0 break-words">
                  Otros miembros en {prettyArea(member.area)}
                </h2>
                <Link href="/miembros" className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:text-white">
                  Ver directorio <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {relatedMembers.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-white/30">No hay más miembros activos registrados en esta área.</p>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-4 min-w-0 overflow-hidden">
                  {relatedMembers.map((related) => (
                    <Link
                      key={related.id}
                      href={`/miembros/${related.id}`}
                      className="group rounded-2xl border border-white/[0.06] bg-white/[0.01] p-5 transition-all hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.03] min-w-0 overflow-hidden w-full sm:min-w-[200px] sm:max-w-[calc(50%-8px)] lg:max-w-[calc(33.333%-11px)]"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Avatar className="h-12 w-12 shrink-0 border border-white/[0.08] bg-white/[0.02]">
                          <AvatarFallback className="text-xs font-bold text-white/50 bg-transparent">{getInitials(related.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="truncate sm:whitespace-normal sm:overflow-visible sm:break-words text-sm font-bold text-white/90 transition-colors group-hover:text-white">{related.name}</p>
                          <p className="text-[9px] mt-1 uppercase tracking-widest text-white/30">Ciclo {related.cycle}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

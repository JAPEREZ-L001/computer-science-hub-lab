import { Lightbulb, Users, Clock, User as UserIcon } from 'lucide-react'

import { createClient } from '@/src/lib/supabase/server'
import { fetchPublishedEvents, fetchUserEventRegistrations } from '@/src/lib/supabase/queries'

import { ContextualSuggestion } from '@/components/contextual-suggestion'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { EventFilters } from '@/components/event-filters'
import { EventsWithCalendar } from '@/components/events-with-calendar'
import { Button } from '@/components/ui/button'

import {
  eventMonth,
  eventSortKey,
  formatEventDateEs,
  isEventPast,
} from '@/src/lib/event-datetime'
import { eventTypeBadgeClass, eventTypeLabel } from '@/src/lib/event-display'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const typeFilter = typeof resolvedSearchParams?.type === 'string' ? resolvedSearchParams.type : 'all'
  const monthFilter = typeof resolvedSearchParams?.month === 'string' ? resolvedSearchParams.month : 'all'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isRealUser = Boolean(user && !user.is_anonymous)

  const [events, registeredEventIds, profileData] = await Promise.all([
    fetchPublishedEvents(),
    isRealUser ? fetchUserEventRegistrations(user!.id) : Promise.resolve([]),
    isRealUser ? supabase.from('profiles').select('role').eq('id', user!.id).maybeSingle() : Promise.resolve({ data: null }),
  ])

  const isAdmin = profileData?.data?.role === 'admin'

  let sorted = [...events].sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)))

  if (typeFilter !== 'all') {
    sorted = sorted.filter(e => e.type === typeFilter)
  }
  
  if (monthFilter !== 'all') {
    sorted = sorted.filter((e) => eventMonth(e).toString() === monthFilter)
  }

  const past = sorted.filter((e) => isEventPast(e))
  const upcoming = sorted.filter((e) => !isEventPast(e))

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden pt-10">
      <Header />
      
      <section className="relative pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="mb-6 inline-block text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">
              Agenda CSH
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Próximos <span className="text-white/40">Eventos</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/50">
              Workshops, charlas y hackathons diseñados para seguir aprendiendo y construyendo en comunidad. Inscríbete a los que más se alineen a tu interés.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6">
        {/* Banner de Info */}
        {isRealUser ? (
          <div className="mb-12 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                Tu cuenta está activa
              </p>
              <p className="mt-1 text-sm text-emerald-400/70">
                Usá &quot;Inscribirme&quot; en cada evento para asegurar tu cupo. Si hay link externo, se abrirá en una pestaña nueva.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-12 rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white/90">
                Visualizando como invitado
              </p>
              <p className="mt-1 text-sm text-white/50">
                Podés ver todo el calendario sin cuenta. Para inscribirte, crea tu cuenta pulsando en el botón de inscripción.
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <EventFilters />

        <div className="mb-24 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/30 mb-8 border-b border-white/[0.06] pb-4">
            Eventos por venir
          </h2>
          <EventsWithCalendar
            upcomingEvents={upcoming}
            calendarEvents={sorted}
            registeredEventIds={registeredEventIds}
            isAdmin={isAdmin}
            isRealUser={isRealUser}
            currentUserId={user?.id}
            emptyState={
              <Empty className="border-white/[0.06] bg-white/[0.01]">
                <EmptyHeader>
                  <EmptyTitle className="text-white">
                    {past.length > 0 && typeFilter === 'all' && monthFilter === 'all'
                      ? 'No hay eventos próximos'
                      : 'No se encontraron eventos'}
                  </EmptyTitle>
                  <EmptyContent className="text-white/50">
                    {past.length > 0 && typeFilter === 'all' && monthFilter === 'all'
                      ? 'Los eventos publicados con fecha pasada aparecen en el historial. Publicá uno con fecha futura desde el panel admin para habilitar inscripciones.'
                      : 'Ajusta los filtros o intenta con otra categoría.'}
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            }
          />
        </div>

        {past.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/30 mb-8 border-b border-white/[0.06] pb-4">
              Historial del Hub
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {past.map((e) => (
                <div key={e.id} className="group relative flex flex-col gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 transition-all hover:bg-white/[0.02]">
                  <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-bold ${eventTypeBadgeClass(e.type)} opacity-60`}>
                      {eventTypeLabel(e.type)}
                    </span>
                    <span className="text-xs font-medium text-white/30">{formatEventDateEs(e.date)}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white/60">
                    {e.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      <span>{e.time}</span>
                    </div>
                    {e.speaker && (
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />
                        <span>{e.speaker}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 border-t border-white/[0.04] pt-4">
                    <Button
                      disabled
                      variant="secondary"
                      size="sm"
                      className="gap-2 opacity-60"
                      aria-label={`${e.title}: evento finalizado`}
                    >
                      Evento finalizado
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ContextualSuggestion
        theme="dark"
        suggestions={[
          {
            title: 'Ideas en votación',
            description: 'Participá activamente decidiendo el rumbo de las siguientes actividades del hub.',
            href: '/comunidad/ideas',
            icon: Lightbulb,
            requiresAuth: true,
          },
          {
            title: 'Mentores del Hub',
            description: 'Conectá con profesionales y preparate como ponente para el próximo evento.',
            href: '/comunidad/mentores',
            icon: Users,
            requiresAuth: true,
          },
        ]}
      />

      <Footer />
    </main>
  )
}

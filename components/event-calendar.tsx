'use client'

import { useId, useMemo, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon } from 'lucide-react'

import { DeleteEventButton } from '@/components/delete-event-button'
import { EventSubscribeButton } from '@/components/event-subscribe-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { eventCalendarDate, eventDateKey, eventSortKey, formatEventDateEs, isEventPast } from '@/src/lib/event-datetime'
import { eventTypeBadgeClass, eventTypeDotClass, eventTypeLabel } from '@/src/lib/event-display'
import type { HubEvent } from '@/src/types'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

type EventCalendarProps = {
  events: HubEvent[]
  registeredEventIds: string[]
  isAdmin: boolean
  isRealUser: boolean
  currentUserId?: string
}

function chunkWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export function EventCalendar({
  events,
  registeredEventIds,
  isAdmin,
  isRealUser,
  currentUserId,
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [dayDialogKey, setDayDialogKey] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<HubEvent | null>(null)
  const dayButtonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const headingId = useId()

  const eventsByDay = useMemo(() => {
    const map = new Map<string, HubEvent[]>()
    for (const event of events) {
      const key = eventDateKey(event)
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)))
    }
    return map
  }, [events])

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const gridEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentMonth])

  const weeks = useMemo(() => chunkWeeks(days), [days])

  const agendaDays = useMemo(() => {
    return days
      .filter((day) => isSameMonth(day, currentMonth))
      .map((day) => ({ day, dateKey: format(day, 'yyyy-MM-dd'), events: eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? [] }))
      .filter((entry) => entry.events.length > 0)
  }, [days, currentMonth, eventsByDay])

  const dayDialogEvents = dayDialogKey ? (eventsByDay.get(dayDialogKey) ?? []) : []

  function focusDay(targetIndex: number) {
    const clamped = Math.max(0, Math.min(days.length - 1, targetIndex))
    dayButtonRefs.current[clamped]?.focus()
  }

  function handleDayKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        focusDay(index + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusDay(index - 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        focusDay(index + 7)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusDay(index - 7)
        break
      case 'Home':
        e.preventDefault()
        focusDay(index - (index % 7))
        break
      case 'End':
        e.preventDefault()
        focusDay(index - (index % 7) + 6)
        break
    }
  }

  function openDay(dateKey: string, dayEvents: HubEvent[]) {
    if (dayEvents.length === 0) return
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0])
      return
    }
    setDayDialogKey(dateKey)
  }

  function openEventFromDayDialog(event: HubEvent) {
    setDayDialogKey(null)
    setSelectedEvent(event)
  }

  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: es })
  const monthHasEvents = agendaDays.length > 0
  const isCurrentMonthInView = isSameMonth(currentMonth, new Date())

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="h-4 w-4 shrink-0 text-white/40" />
          <h3
            id={headingId}
            className="truncate text-base font-bold capitalize text-white"
            aria-live="polite"
          >
            {monthLabel}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.02] p-1">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            className="rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Hoy
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!monthHasEvents && (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-7 text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Hoy</span>
          <span className="text-xl font-bold text-white">
            {format(new Date(), "d 'de' MMMM", { locale: es })}
          </span>
          <span className="mt-1 text-xs text-white/40">
            Sin eventos programados {isCurrentMonthInView ? 'este mes' : `en ${monthLabel}`}
          </span>
        </div>
      )}

      {monthHasEvents && (
        <>
          {/* Vista de grid — escritorio */}
          <div
            className="hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-3 sm:block"
            role="grid"
            aria-labelledby={headingId}
          >
            <div role="row" className="mb-2 grid grid-cols-7">
              {WEEKDAY_LABELS.map((label) => (
                <div
                  key={label}
                  role="columnheader"
                  className="py-1 text-center text-[9px] font-bold uppercase tracking-widest text-white/30"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} role="row" className="grid grid-cols-7 gap-1">
                  {week.map((day) => {
                    const flatIndex = days.indexOf(day)
                    const dateKey = format(day, 'yyyy-MM-dd')
                    const dayEvents = eventsByDay.get(dateKey) ?? []
                    const inMonth = isSameMonth(day, currentMonth)
                    const hasEvents = dayEvents.length > 0
                    const today = isToday(day)

                    const cellLabel = hasEvents
                      ? `${format(day, "d 'de' MMMM", { locale: es })}: ${dayEvents.length} ${dayEvents.length === 1 ? 'evento' : 'eventos'} — ${dayEvents.map((e) => e.title).join(', ')}`
                      : format(day, "d 'de' MMMM", { locale: es })

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        role="gridcell"
                        ref={(el) => {
                          dayButtonRefs.current[flatIndex] = el
                        }}
                        tabIndex={flatIndex === 0 ? 0 : -1}
                        onKeyDown={(e) => handleDayKeyDown(e, flatIndex)}
                        onClick={() => openDay(dateKey, dayEvents)}
                        aria-label={cellLabel}
                        className={`flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                          hasEvents ? 'cursor-pointer hover:bg-white/[0.08]' : 'cursor-default hover:bg-white/[0.03]'
                        } ${inMonth ? '' : 'opacity-25'}`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                            today
                              ? 'bg-white text-[#0D0D0D] shadow-[0_0_10px_rgba(255,255,255,0.35)]'
                              : hasEvents
                                ? 'text-white/80'
                                : 'text-white/30'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        {hasEvents ? (
                          <div className="flex h-1.5 items-center justify-center gap-[3px]">
                            {dayEvents.slice(0, 3).map((event) => (
                              <span
                                key={event.id}
                                aria-hidden="true"
                                className={`h-1.5 w-1.5 rounded-full ${eventTypeDotClass(event.type)} ${isEventPast(event) ? 'opacity-40' : ''}`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span aria-hidden="true" className="text-[7px] font-bold leading-none text-white/40">
                                +{dayEvents.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-1.5" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Vista de agenda — móvil */}
          <div className="space-y-4 sm:hidden" role="list" aria-labelledby={headingId}>
            {agendaDays.map(({ day, events: dayEvents }) => (
              <div key={day.toISOString()} role="listitem" className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${isToday(day) ? 'text-white' : 'text-white/40'}`}>
                  {format(day, "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white">{event.title}</span>
                        <span className="text-xs text-white/40">{event.time}</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${eventTypeBadgeClass(event.type)}`}>
                        {eventTypeLabel(event.type)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Diálogo: eventos del día (cuando hay más de uno) */}
      <Dialog open={dayDialogKey !== null} onOpenChange={(open) => !open && setDayDialogKey(null)}>
        <DialogContent className="border-white/10 bg-[#111] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/50" />
              {dayDialogKey ? format(eventCalendarDate({ date: dayDialogKey }), "d 'de' MMMM 'de' yyyy", { locale: es }) : ''}
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {dayDialogEvents.length} eventos programados este día. Elegí uno para ver el detalle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {dayDialogEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => openEventFromDayDialog(event)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{event.title}</span>
                  <span className="text-xs text-white/40">{event.time} · {event.location}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${eventTypeBadgeClass(event.type)}`}>
                  {eventTypeLabel(event.type)}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo: detalle del evento */}
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="border-white/10 bg-[#111] text-white">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${eventTypeBadgeClass(selectedEvent.type)}`}>
                    {eventTypeLabel(selectedEvent.type)}
                  </span>
                  <span className="text-xs font-medium text-white/40">{formatEventDateEs(selectedEvent.date)}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-white">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-white/60">{selectedEvent.description}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 opacity-50" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                  <span>{selectedEvent.location}</span>
                </div>
                {selectedEvent.speaker && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 shrink-0 opacity-50" />
                    <span>{selectedEvent.speaker}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-4">
                {isEventPast(selectedEvent) ? (
                  <Button disabled variant="secondary" size="sm" className="opacity-60">
                    Evento finalizado
                  </Button>
                ) : (
                  <EventSubscribeButton
                    eventId={selectedEvent.id}
                    registrationUrl={selectedEvent.registrationUrl}
                    initialIsRegistered={registeredEventIds.includes(selectedEvent.id)}
                  />
                )}
                {(isAdmin || (isRealUser && selectedEvent.createdBy === currentUserId)) && (
                  <DeleteEventButton eventId={selectedEvent.id} eventTitle={selectedEvent.title} />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

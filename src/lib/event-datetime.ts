import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { HubEvent } from '@/src/types'

/**
 * Zona horaria de referencia del hub (campus UDB, Antiguo Cuscatlán).
 *
 * Todo el cálculo de "pasado vs próximo" se ancla aquí a propósito: el server
 * de Next corre en UTC en producción y el navegador en la zona del visitante,
 * así que sin una zona fija el mismo evento podía clasificarse distinto según
 * dónde se renderizara.
 */
export const HUB_TIME_ZONE = 'America/El_Salvador'

/** Fecha calendario `YYYY-MM-DD`, ignorando cualquier hora que venga adjunta. */
export function eventDateKey(event: Pick<HubEvent, 'date'>): string {
  return event.date.slice(0, 10)
}

/** Hoy en la zona del hub, como `YYYY-MM-DD` (el locale `en-CA` da ese formato). */
export function todayInHubTimeZone(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: HUB_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/**
 * Evento pasado si su fecha calendario es anterior a hoy en la zona del hub.
 * Compara strings `YYYY-MM-DD`, que es orden cronológico y no pasa por `Date`.
 */
export function isEventPast(event: Pick<HubEvent, 'date'>): boolean {
  return eventDateKey(event) < todayInHubTimeZone()
}

/**
 * Fecha calendario como `Date` en componentes locales.
 * Existe para formatear: `new Date('2026-04-05')` se parsea como medianoche
 * UTC y en El Salvador (UTC-6) se muestra como el día anterior.
 */
export function eventCalendarDate(event: Pick<HubEvent, 'date'>): Date {
  const [year, month, day] = eventDateKey(event).split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Mes del evento (1-12), leído del string para no depender de la zona. */
export function eventMonth(event: Pick<HubEvent, 'date'>): number {
  return Number(eventDateKey(event).slice(5, 7))
}

/** Clave de orden cronológico `YYYY-MM-DDTHH:MM`, estable en cualquier zona. */
export function eventSortKey(event: Pick<HubEvent, 'date' | 'time'>): string {
  const [hours = '00', minutes = '00'] = (event.time ?? '').split(':')
  return `${eventDateKey(event)}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

/** Fecha del evento formateada en español, sin desfase de zona horaria. */
export function formatEventDateEs(
  date: string,
  pattern = "d 'de' MMMM 'de' yyyy",
): string {
  return format(eventCalendarDate({ date }), pattern, { locale: es })
}

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  eventDateKey,
  eventMonth,
  eventSortKey,
  formatEventDateEs,
  isEventPast,
  todayInHubTimeZone,
} from './event-datetime'

afterEach(() => {
  vi.useRealTimers()
})

describe('formatEventDateEs', () => {
  it('muestra el mismo dia que se guardo, sin corrimiento por UTC', () => {
    // Regresion: new Date('2026-04-05') se parsea como medianoche UTC y en
    // El Salvador (UTC-6) se renderizaba como "4 de abril".
    expect(formatEventDateEs('2026-04-05')).toBe('5 de abril de 2026')
    expect(formatEventDateEs('2026-01-01')).toBe('1 de enero de 2026')
  })

  it('acepta un patron alternativo', () => {
    expect(formatEventDateEs('2026-05-03', "d 'de' MMMM")).toBe('3 de mayo')
  })
})

describe('eventDateKey', () => {
  it('recorta cualquier hora adjunta', () => {
    expect(eventDateKey({ date: '2026-04-05' })).toBe('2026-04-05')
    expect(eventDateKey({ date: '2026-04-05T00:00:00+00:00' })).toBe('2026-04-05')
  })
})

describe('eventMonth', () => {
  it('lee el mes del string, no de un Date', () => {
    expect(eventMonth({ date: '2026-01-31' })).toBe(1)
    expect(eventMonth({ date: '2026-12-01' })).toBe(12)
  })
})

describe('eventSortKey', () => {
  it('ordena por fecha y luego por hora', () => {
    const events = [
      { date: '2026-04-05', time: '17:00' },
      { date: '2026-04-05', time: '09:00' },
      { date: '2026-03-01', time: '23:00' },
    ]
    const ordered = [...events]
      .sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)))
      .map((e) => `${e.date} ${e.time}`)

    expect(ordered).toEqual(['2026-03-01 23:00', '2026-04-05 09:00', '2026-04-05 17:00'])
  })

  it('normaliza horas de un solo digito y horas faltantes', () => {
    expect(eventSortKey({ date: '2026-04-05', time: '9:00' })).toBe('2026-04-05T09:00')
    expect(eventSortKey({ date: '2026-04-05', time: '' })).toBe('2026-04-05T00:00')
  })
})

describe('isEventPast', () => {
  it('usa la zona del hub y no la del servidor', () => {
    // 03:00 UTC del 2 de septiembre es todavia el 1 de septiembre, 21:00, en
    // El Salvador (UTC-6). Un evento del dia 1 NO deberia contar como pasado.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-02T03:00:00Z'))

    expect(todayInHubTimeZone()).toBe('2026-09-01')
    expect(isEventPast({ date: '2026-09-01' })).toBe(false)
    expect(isEventPast({ date: '2026-08-31' })).toBe(true)
    expect(isEventPast({ date: '2026-09-02' })).toBe(false)
  })

  it('el evento de hoy sigue siendo proximo durante todo el dia', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T23:30:00-06:00'))

    expect(isEventPast({ date: '2026-04-05' })).toBe(false)
    expect(isEventPast({ date: '2026-04-04' })).toBe(true)
  })
})

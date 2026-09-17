import { describe, expect, it } from 'vitest'
import { updateMentorSessionSchema, updateReinforcementTopicsSchema } from './tutoring'
import { resolveTutoringStage } from '@/src/lib/tutoring-display'

const UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('updateReinforcementTopicsSchema', () => {
  it('acepta vaciar los temas', () => {
    expect(
      updateReinforcementTopicsSchema.safeParse({ id: UUID, reinforcement_topics: '' }).success,
    ).toBe(true)
  })

  it('rechaza un texto por encima del límite', () => {
    expect(
      updateReinforcementTopicsSchema.safeParse({
        id: UUID,
        reinforcement_topics: 'a'.repeat(1001),
      }).success,
    ).toBe(false)
  })
})

describe('updateMentorSessionSchema', () => {
  const base = {
    id: UUID,
    session_location: 'Aula B-203',
    session_at: '2026-10-01T15:30',
    mentor_notes: '',
    status: 'matched',
  }

  it('acepta una sesión completa', () => {
    expect(updateMentorSessionSchema.safeParse(base).success).toBe(true)
  })

  it('acepta la sesión sin fecha todavía', () => {
    expect(updateMentorSessionSchema.safeParse({ ...base, session_at: '' }).success).toBe(true)
  })

  it('rechaza una fecha sin hora', () => {
    expect(updateMentorSessionSchema.safeParse({ ...base, session_at: '2026-10-01' }).success).toBe(
      false,
    )
  })

  it('no deja al mentor devolver la tutoría a pending', () => {
    expect(updateMentorSessionSchema.safeParse({ ...base, status: 'pending' }).success).toBe(false)
  })
})

describe('resolveTutoringStage', () => {
  it('sin mentor asignado sigue pendiente', () => {
    expect(
      resolveTutoringStage({ status: 'pending', session_at: null, session_location: null }),
    ).toBe('pending')
  })

  it('emparejada sin logística queda a la espera de agenda', () => {
    expect(
      resolveTutoringStage({ status: 'matched', session_at: null, session_location: null }),
    ).toBe('awaiting_schedule')
  })

  it('con fecha pero sin aula todavía no está agendada', () => {
    expect(
      resolveTutoringStage({
        status: 'matched',
        session_at: '2026-10-01T15:30:00Z',
        session_location: null,
      }),
    ).toBe('awaiting_schedule')
  })

  it('con fecha y aula queda agendada', () => {
    expect(
      resolveTutoringStage({
        status: 'matched',
        session_at: '2026-10-01T15:30:00Z',
        session_location: 'Aula B-203',
      }),
    ).toBe('scheduled')
  })

  it('cerrada gana sobre cualquier logística', () => {
    expect(
      resolveTutoringStage({
        status: 'closed',
        session_at: '2026-10-01T15:30:00Z',
        session_location: 'Aula B-203',
      }),
    ).toBe('closed')
  })
})

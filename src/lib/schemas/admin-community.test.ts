import { describe, expect, it } from 'vitest'
import { saveIdeaSchema, updateTutoringSchema } from './admin-community'

const UUID = '550e8400-e29b-41d4-a716-446655440000'

const baseIdea = {
  id: UUID,
  title: 'Sala de proyectos 24/7',
  description: '',
  category: '',
  impact: '',
  tags: '',
  status: 'open',
  execution_status: 'proposed',
  execution_notes: '',
  owner_id: '',
  location: '',
  scheduled_at: '',
}

describe('saveIdeaSchema', () => {
  it('acepta los campos opcionales vacíos', () => {
    expect(saveIdeaSchema.safeParse(baseIdea).success).toBe(true)
  })

  it('rechaza un título vacío', () => {
    expect(saveIdeaSchema.safeParse({ ...baseIdea, title: '   ' }).success).toBe(false)
  })

  it('rechaza un execution_status fuera del CHECK de la tabla', () => {
    expect(saveIdeaSchema.safeParse({ ...baseIdea, execution_status: 'cancelada' }).success).toBe(
      false,
    )
  })

  it('no admite "archived" como visibilidad: el panel solo expone abrir/cerrar', () => {
    expect(saveIdeaSchema.safeParse({ ...baseIdea, status: 'archived' }).success).toBe(false)
  })

  it('rechaza un owner_id que no sea UUID ni cadena vacía', () => {
    expect(saveIdeaSchema.safeParse({ ...baseIdea, owner_id: 'yo' }).success).toBe(false)
  })

  it('acepta una fecha ISO y rechaza otros formatos', () => {
    expect(saveIdeaSchema.safeParse({ ...baseIdea, scheduled_at: '2026-10-01' }).success).toBe(true)
    expect(saveIdeaSchema.safeParse({ ...baseIdea, scheduled_at: '01/10/2026' }).success).toBe(false)
  })
})

describe('updateTutoringSchema', () => {
  it('acepta "" como mentor sin asignar', () => {
    const parsed = updateTutoringSchema.safeParse({
      id: UUID,
      status: 'pending',
      assigned_mentor_id: '',
    })
    expect(parsed.success).toBe(true)
  })

  it('rechaza un estado que no existe en la tabla', () => {
    expect(
      updateTutoringSchema.safeParse({
        id: UUID,
        status: 'in_progress',
        assigned_mentor_id: '',
      }).success,
    ).toBe(false)
  })
})

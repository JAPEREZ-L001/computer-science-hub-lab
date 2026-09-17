import { describe, expect, it } from 'vitest'
import { uuidSchema } from './common'

describe('uuidSchema', () => {
  it('acepta un UUID válido', () => {
    expect(uuidSchema.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true)
  })

  it('rechaza texto arbitrario', () => {
    expect(uuidSchema.safeParse('no-es-un-uuid').success).toBe(false)
  })

  it('rechaza un intento de inyección SQL', () => {
    expect(uuidSchema.safeParse("'; DROP TABLE profiles; --").success).toBe(false)
  })
})

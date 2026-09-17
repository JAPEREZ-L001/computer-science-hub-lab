import { z } from 'zod'

import { uuidSchema } from '@/src/lib/schemas/common'

// 'archived' existe en el CHECK de community_ideas pero el panel de admin no lo
// expone: el issue #33 solo pide abrir/cerrar.
const IDEA_STATUSES = ['open', 'closed'] as const
const IDEA_CATEGORIES = ['feature', 'improvement', 'bug', 'other'] as const
const IDEA_IMPACTS = ['high', 'medium', 'low'] as const
const IDEA_EXECUTION_STATUSES = [
  'proposed',
  'planned',
  'in_progress',
  'done',
  'discarded',
] as const

/** '' = campo opcional sin valor; se guarda como NULL. */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal('')])

const optionalUuid = z.union([uuidSchema, z.literal('')])

export const updateIdeaStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(IDEA_STATUSES),
})

export const toggleIdeaPinnedSchema = z.object({
  id: uuidSchema,
  pinned: z.boolean(),
})

export const saveIdeaSchema = z.object({
  id: uuidSchema,
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  description: z.string().trim().optional().default(''),
  category: optionalEnum(IDEA_CATEGORIES),
  impact: optionalEnum(IDEA_IMPACTS),
  tags: z.string().trim().optional().default(''),
  status: z.enum(IDEA_STATUSES),
  execution_status: z.enum(IDEA_EXECUTION_STATUSES),
  execution_notes: z.string().trim().optional().default(''),
  owner_id: optionalUuid,
  location: z.string().trim().optional().default(''),
  // <input type="date"> entrega '' cuando está vacío y 'YYYY-MM-DD' si no.
  scheduled_at: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Fecha inválida.')
    .optional()
    .default(''),
})

const TUTORING_STATUSES = ['pending', 'matched', 'closed'] as const

export const updateTutoringSchema = z.object({
  id: uuidSchema,
  status: z.enum(TUTORING_STATUSES),
  // '' significa "sin asignar" (assigned_mentor_id -> null).
  assigned_mentor_id: optionalUuid,
  session_location: z.string().trim().max(200, 'Máximo 200 caracteres.').optional().default(''),
  // <input type="datetime-local"> entrega '' o 'YYYY-MM-DDTHH:mm'.
  session_at: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})?$/, 'Fecha y hora inválidas.')
    .optional()
    .default(''),
  mentor_notes: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional().default(''),
})

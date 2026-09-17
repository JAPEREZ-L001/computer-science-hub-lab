import { z } from 'zod'

import { uuidSchema } from '@/src/lib/schemas/common'

// 'archived' existe en el CHECK de community_ideas pero el panel de admin no lo
// expone: el issue #33 solo pide abrir/cerrar.
const IDEA_STATUSES = ['open', 'closed'] as const

export const updateIdeaStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(IDEA_STATUSES),
})

export const toggleIdeaPinnedSchema = z.object({
  id: uuidSchema,
  pinned: z.boolean(),
})

const TUTORING_STATUSES = ['pending', 'matched', 'closed'] as const

export const updateTutoringSchema = z.object({
  id: uuidSchema,
  status: z.enum(TUTORING_STATUSES),
  // '' significa "sin asignar" (assigned_mentor_id -> null).
  assigned_mentor_id: z.union([uuidSchema, z.literal('')]),
})

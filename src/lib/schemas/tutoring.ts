import { z } from 'zod'

import { uuidSchema } from '@/src/lib/schemas/common'

/** Lo que el alumno puede editar de su propia solicitud. */
export const updateReinforcementTopicsSchema = z.object({
  id: uuidSchema,
  reinforcement_topics: z
    .string()
    .trim()
    .max(1000, 'Máximo 1000 caracteres.')
    .optional()
    .default(''),
})

/**
 * Lo que el mentor puede fijar. El resto de columnas se lo bloquea el trigger
 * `tutoring_requests_guard_columns`, así que este schema y la RLS dicen lo
 * mismo desde los dos lados.
 */
export const updateMentorSessionSchema = z.object({
  id: uuidSchema,
  session_location: z.string().trim().max(200, 'Máximo 200 caracteres.').optional().default(''),
  // <input type="datetime-local"> entrega '' o 'YYYY-MM-DDTHH:mm'.
  session_at: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})?$/, 'Fecha y hora inválidas.')
    .optional()
    .default(''),
  mentor_notes: z.string().trim().max(2000, 'Máximo 2000 caracteres.').optional().default(''),
  // 'matched' mientras esté en curso; 'closed' al darla por terminada.
  status: z.enum(['matched', 'closed']),
})

import { z } from 'zod'

import { uuidSchema } from '@/src/lib/schemas/common'

export const toggleEventRegistrationSchema = z.object({
  eventId: uuidSchema,
})

const EVENT_TYPES = ['workshop', 'charla', 'hackathon', 'copa', 'networking', 'otro'] as const

export const saveEventSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  description: z.string().trim().optional().default(''),
  event_date: z.string().trim().min(1, 'La fecha es obligatoria.'),
  event_time: z.string().trim().optional().default(''),
  speaker: z.string().trim().optional().default(''),
  type: z.enum(EVENT_TYPES).catch('otro'),
  location: z.string().trim().optional().default(''),
  registration_url: z.string().trim().optional().default(''),
  published: z.boolean(),
})

export type SaveEventInput = z.infer<typeof saveEventSchema>

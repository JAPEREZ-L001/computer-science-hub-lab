import { z } from 'zod'

import { uuidSchema } from '@/src/lib/schemas/common'

const AREAS = [
  'frontend',
  'backend',
  'diseño',
  'devops',
  'ia',
  'ciberseguridad',
  'robótica',
  'juegos',
  'general',
] as const
const STATUSES = ['activo', 'inactivo'] as const
const ROLES = ['member', 'admin'] as const

export const updateMemberProfileSchema = z.object({
  id: uuidSchema,
  full_name: z.string().trim().optional().default(''),
  career: z.string().trim().optional().default(''),
  cycle: z.string().trim().optional().default(''),
  area: z.enum(AREAS).catch('general'),
  status: z.enum(STATUSES).catch('activo'),
  role: z.enum(ROLES).catch('member'),
  bio: z.string().trim().optional().default(''),
  github_url: z.string().trim().optional().default(''),
  linkedin_url: z.string().trim().optional().default(''),
})

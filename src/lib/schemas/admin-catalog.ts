import { z } from 'zod'

const NEWS_CATEGORIES = ['anuncio', 'logro', 'evento', 'update'] as const
const RESOURCE_CATEGORIES = ['computacion', 'diseño', 'profesional'] as const
const SPONSOR_TIERS = ['principal', 'colaborador', 'aliado'] as const

export const saveNewsSchema = z.object({
  id: z.string().optional(),
  slug: z.string().trim().optional().default(''),
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  excerpt: z.string().trim().optional().default(''),
  content: z.string().trim().optional().default(''),
  category: z.enum(NEWS_CATEGORIES).catch('update'),
  published: z.boolean(),
  published_at: z.string().trim().optional().default(''),
})

export const saveOpportunitySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  organization: z.string().trim().min(1, 'La organización es obligatoria.'),
  description: z.string().trim().optional().default(''),
  url: z.string().trim().optional().default(''),
  type: z.string().trim().optional().default(''),
  published: z.boolean(),
})

export const saveResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  description: z.string().trim().optional().default(''),
  url: z.string().trim().optional().default(''),
  category: z.enum(RESOURCE_CATEGORIES).catch('computacion'),
  tags: z.string().trim().optional().default(''),
  published: z.boolean(),
})

export const saveSponsorSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'El nombre es obligatorio.'),
  logo_url: z.string().trim().optional().default(''),
  website_url: z.string().trim().optional().default(''),
  tier: z.enum(SPONSOR_TIERS).catch('aliado'),
  active: z.boolean(),
})

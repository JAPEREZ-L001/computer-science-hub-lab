'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/src/lib/supabase/server'
import { sanitizeOptionalUrl } from '@/src/lib/url-validation'

const personalEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Ingresa un email válido')
  .optional()
  .or(z.literal(''))

const AREAS = ['frontend', 'backend', 'diseño', 'devops', 'ia', 'ciberseguridad', 'robótica', 'juegos', 'general'] as const
const CAREER_OPTIONS = [
  'Ing. en Ciencias de la Computación',
  'Licenciatura en Ingeniería de Software',
  'Ing. en Sistemas Informáticos',
  'Licenciatura en Diseño de Experiencias Digitales',
  'Ing. Industrial',
  'Ingeniería en Desarrollo de Contenidos Digitales y Robótica Aplicada',
] as const

const GENERIC_ERROR = 'Error al guardar. Intentá de nuevo.'

export async function updateProfile(form: {
  full_name: string
  career: string
  cycle: string
  area: string
  bio: string
  github_url: string
  linkedin_url: string
  avatar_palette_index?: string
  banner_palette_index?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return { ok: false as const, message: 'No autenticado.' }
  }

  const area = AREAS.includes(form.area as (typeof AREAS)[number]) ? form.area : 'general'
  const career = CAREER_OPTIONS.includes(form.career as (typeof CAREER_OPTIONS)[number])
    ? form.career
    : form.career.trim() || null

  let cycle: number | null = null
  if (form.cycle.trim()) {
    const n = Number.parseInt(form.cycle, 10)
    if (!Number.isNaN(n) && n >= 1 && n <= 10) cycle = n
  }

  let avatarPaletteIndex: number | null = null
  if (form.avatar_palette_index != null && form.avatar_palette_index !== '') {
    const n = Number.parseInt(form.avatar_palette_index, 10)
    if (!Number.isNaN(n) && n >= 0 && n <= 9) avatarPaletteIndex = n
  }

  let bannerPaletteIndex: number | null = null
  if (form.banner_palette_index != null && form.banner_palette_index !== '') {
    const n = Number.parseInt(form.banner_palette_index, 10)
    if (!Number.isNaN(n) && n >= 0 && n <= 9) bannerPaletteIndex = n
  }

  const githubUrl = sanitizeOptionalUrl(form.github_url)
  if (form.github_url.trim() && !githubUrl) {
    return { ok: false as const, message: 'La URL de GitHub no es válida.' }
  }

  const linkedinUrl = sanitizeOptionalUrl(form.linkedin_url)
  if (form.linkedin_url.trim() && !linkedinUrl) {
    return { ok: false as const, message: 'La URL de LinkedIn no es válida.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: form.full_name.trim() || null,
      career,
      cycle,
      area,
      bio: form.bio.trim() || null,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
      avatar_palette_index: avatarPaletteIndex,
      banner_palette_index: bannerPaletteIndex,
    })
    .eq('id', user.id)

  if (error) {
    console.error('updateProfile', error)
    return { ok: false as const, message: GENERIC_ERROR }
  }

  revalidatePath('/perfil')
  revalidatePath('/miembros')
  return { ok: true as const }
}

export async function updatePersonalEmail(personalEmail: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return { ok: false as const, message: 'No autenticado.' }
  }

  const parsed = personalEmailSchema.safeParse(personalEmail)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_ERROR }
  }

  const value = parsed.data || null

  const { error } = await supabase
    .from('profile_contacts')
    .upsert(
      { user_id: user.id, personal_email: value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )

  if (error) {
    console.error('updatePersonalEmail', error)
    return { ok: false as const, message: GENERIC_ERROR }
  }

  revalidatePath('/perfil')
  return { ok: true as const }
}

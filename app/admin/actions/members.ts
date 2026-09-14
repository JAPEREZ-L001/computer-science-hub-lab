'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { isValidUUID, sanitizeOptionalUrl } from '@/src/lib/url-validation'

const areas = ['frontend', 'backend', 'diseño', 'devops', 'ia', 'ciberseguridad', 'robótica', 'juegos', 'general'] as const
const statuses = ['activo', 'inactivo'] as const
const roles = ['member', 'admin'] as const
const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

export async function updateMemberProfile(form: {
  id: string
  full_name: string
  career: string
  cycle: string
  area: string
  status: string
  role: string
  bio: string
  github_url: string
  linkedin_url: string
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!isValidUUID(form.id)) return { ok: false as const, message: 'ID inválido.' }

  const area = areas.includes(form.area as (typeof areas)[number]) ? form.area : 'general'
  const status = statuses.includes(form.status as (typeof statuses)[number])
    ? form.status
    : 'activo'
  const role = roles.includes(form.role as (typeof roles)[number]) ? form.role : 'member'

  if (form.id === ctx.user.id && role !== 'admin') {
    return { ok: false as const, message: 'No puedes quitarte el rol de administrador a ti mismo.' }
  }

  if (role !== 'admin') {
    const { count, error: countErr } = await ctx.supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (countErr) {
      console.error('updateMemberProfile:countAdmins', countErr)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }

    if ((count ?? 0) <= 1) {
      return { ok: false as const, message: 'No se puede quitar el último administrador.' }
    }
  }

  let cycle: number | null = null
  if (form.cycle.trim()) {
    const n = Number.parseInt(form.cycle, 10)
    if (!Number.isNaN(n)) cycle = n
  }

  const row = {
    full_name: form.full_name.trim() || null,
    career: form.career.trim() || null,
    cycle,
    area,
    status,
    role,
    bio: form.bio.trim() || null,
    github_url: sanitizeOptionalUrl(form.github_url),
    linkedin_url: sanitizeOptionalUrl(form.linkedin_url),
  }

  const { error } = await ctx.supabase.from('profiles').update(row).eq('id', form.id)
  if (error) {
    console.error('updateMemberProfile', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/miembros')
  revalidatePath('/miembros')
  revalidatePath('/perfil')
  return { ok: true as const }
}

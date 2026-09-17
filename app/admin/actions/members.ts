'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { sanitizeOptionalUrl } from '@/src/lib/url-validation'
import { updateMemberProfileSchema } from '@/src/lib/schemas/admin-members'

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

  const parsed = updateMemberProfileSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? 'ID inválido.' }
  }

  const { area, status, role } = parsed.data

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
  if (parsed.data.cycle.trim()) {
    const n = Number.parseInt(parsed.data.cycle, 10)
    if (!Number.isNaN(n)) cycle = n
  }

  const row = {
    full_name: parsed.data.full_name.trim() || null,
    career: parsed.data.career.trim() || null,
    cycle,
    area,
    status,
    role,
    bio: parsed.data.bio.trim() || null,
    github_url: sanitizeOptionalUrl(parsed.data.github_url),
    linkedin_url: sanitizeOptionalUrl(parsed.data.linkedin_url),
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

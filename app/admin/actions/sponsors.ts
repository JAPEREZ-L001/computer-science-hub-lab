'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { isValidUUID, sanitizeOptionalUrl } from '@/src/lib/url-validation'

const tiers = ['principal', 'colaborador', 'aliado'] as const
const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

export async function saveSponsor(form: {
  id?: string
  name: string
  logo_url: string
  website_url: string
  tier: string
  active: boolean
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const tier = tiers.includes(form.tier as (typeof tiers)[number]) ? form.tier : 'aliado'
  const row = {
    name: form.name.trim(),
    logo_url: sanitizeOptionalUrl(form.logo_url),
    website_url: sanitizeOptionalUrl(form.website_url),
    tier,
    active: form.active,
  }

  if (!row.name) return { ok: false as const, message: 'El nombre es obligatorio.' }

  if (form.id) {
    if (!isValidUUID(form.id)) return { ok: false as const, message: 'ID inválido.' }
    const { error } = await ctx.supabase.from('sponsors').update(row).eq('id', form.id)
    if (error) {
      console.error('saveSponsor:update', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  } else {
    const { error } = await ctx.supabase.from('sponsors').insert(row)
    if (error) {
      console.error('saveSponsor:insert', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  }

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { ok: true as const }
}

export async function deleteSponsor(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!isValidUUID(id)) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('sponsors').delete().eq('id', id)
  if (error) {
    console.error('deleteSponsor', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { ok: true as const }
}

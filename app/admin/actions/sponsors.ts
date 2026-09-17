'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { sanitizeOptionalUrl } from '@/src/lib/url-validation'
import { uuidSchema } from '@/src/lib/schemas/common'
import { saveSponsorSchema } from '@/src/lib/schemas/admin-catalog'

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

  const parsed = saveSponsorSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const row = {
    name: parsed.data.name,
    logo_url: sanitizeOptionalUrl(parsed.data.logo_url),
    website_url: sanitizeOptionalUrl(parsed.data.website_url),
    tier: parsed.data.tier,
    active: parsed.data.active,
  }

  if (form.id) {
    if (!uuidSchema.safeParse(form.id).success) return { ok: false as const, message: 'ID inválido.' }
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
  if (!uuidSchema.safeParse(id).success) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('sponsors').delete().eq('id', id)
  if (error) {
    console.error('deleteSponsor', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/sponsors')
  revalidatePath('/')
  return { ok: true as const }
}

'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { sanitizeOptionalUrl } from '@/src/lib/url-validation'
import { uuidSchema } from '@/src/lib/schemas/common'
import { saveOpportunitySchema } from '@/src/lib/schemas/admin-catalog'

const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

export async function saveOpportunity(form: {
  id?: string
  title: string
  organization: string
  description: string
  url: string
  type: string
  published: boolean
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const parsed = saveOpportunitySchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const row = {
    title: parsed.data.title,
    organization: parsed.data.organization,
    description: parsed.data.description.trim() || null,
    url: sanitizeOptionalUrl(parsed.data.url) ?? '#',
    type: parsed.data.type.trim() || 'General',
    published: parsed.data.published,
  }

  if (form.id) {
    if (!uuidSchema.safeParse(form.id).success) return { ok: false as const, message: 'ID inválido.' }
    const { error } = await ctx.supabase.from('opportunities').update(row).eq('id', form.id)
    if (error) {
      console.error('saveOpportunity:update', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  } else {
    const { error } = await ctx.supabase.from('opportunities').insert(row)
    if (error) {
      console.error('saveOpportunity:insert', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  }

  revalidatePath('/admin/oportunidades')
  revalidatePath('/oportunidades')
  return { ok: true as const }
}

export async function deleteOpportunity(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!uuidSchema.safeParse(id).success) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('opportunities').delete().eq('id', id)
  if (error) {
    console.error('deleteOpportunity', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/oportunidades')
  revalidatePath('/oportunidades')
  return { ok: true as const }
}

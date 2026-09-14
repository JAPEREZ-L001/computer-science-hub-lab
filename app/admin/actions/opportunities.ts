'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { isValidUUID, sanitizeOptionalUrl } from '@/src/lib/url-validation'

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

  const row = {
    title: form.title.trim(),
    organization: form.organization.trim(),
    description: form.description.trim() || null,
    url: sanitizeOptionalUrl(form.url) ?? '#',
    type: form.type.trim() || 'General',
    published: form.published,
  }

  if (!row.title) return { ok: false as const, message: 'El título es obligatorio.' }
  if (!row.organization) return { ok: false as const, message: 'La organización es obligatoria.' }

  if (form.id) {
    if (!isValidUUID(form.id)) return { ok: false as const, message: 'ID inválido.' }
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
  if (!isValidUUID(id)) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('opportunities').delete().eq('id', id)
  if (error) {
    console.error('deleteOpportunity', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/oportunidades')
  revalidatePath('/oportunidades')
  return { ok: true as const }
}

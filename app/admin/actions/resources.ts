'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { isValidUUID, sanitizeOptionalUrl } from '@/src/lib/url-validation'

const categories = ['computacion', 'diseño', 'profesional'] as const
const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

function parseTags(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export async function saveResource(form: {
  id?: string
  title: string
  description: string
  url: string
  category: string
  tags: string
  published: boolean
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const category = categories.includes(form.category as (typeof categories)[number])
    ? form.category
    : 'computacion'
  let tags = parseTags(form.tags)
  if (tags.length === 0) tags = ['basico']

  const row = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    url: sanitizeOptionalUrl(form.url) ?? '#',
    category,
    tags,
    published: form.published,
  }

  if (!row.title) return { ok: false as const, message: 'El título es obligatorio.' }

  if (form.id) {
    if (!isValidUUID(form.id)) return { ok: false as const, message: 'ID inválido.' }
    const { error } = await ctx.supabase.from('resources').update(row).eq('id', form.id)
    if (error) {
      console.error('saveResource:update', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  } else {
    const { error } = await ctx.supabase.from('resources').insert(row)
    if (error) {
      console.error('saveResource:insert', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  }

  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
  return { ok: true as const }
}

export async function deleteResource(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!isValidUUID(id)) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('resources').delete().eq('id', id)
  if (error) {
    console.error('deleteResource', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
  return { ok: true as const }
}

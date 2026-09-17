'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { sanitizeOptionalUrl } from '@/src/lib/url-validation'
import { uuidSchema } from '@/src/lib/schemas/common'
import { saveResourceSchema } from '@/src/lib/schemas/admin-catalog'

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

  const parsed = saveResourceSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  let tags = parseTags(parsed.data.tags)
  if (tags.length === 0) tags = ['basico']

  const row = {
    title: parsed.data.title,
    description: parsed.data.description.trim() || null,
    url: sanitizeOptionalUrl(parsed.data.url) ?? '#',
    category: parsed.data.category,
    tags,
    published: parsed.data.published,
  }

  if (form.id) {
    if (!uuidSchema.safeParse(form.id).success) return { ok: false as const, message: 'ID inválido.' }
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
  if (!uuidSchema.safeParse(id).success) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('resources').delete().eq('id', id)
  if (error) {
    console.error('deleteResource', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/recursos')
  revalidatePath('/recursos')
  return { ok: true as const }
}

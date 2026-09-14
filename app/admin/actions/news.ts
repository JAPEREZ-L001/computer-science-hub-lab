'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { slugify } from '@/src/lib/slugify'
import { isValidUUID } from '@/src/lib/url-validation'

const categories = ['anuncio', 'logro', 'evento', 'update'] as const
const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

export async function saveNews(form: {
  id?: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  published: boolean
  published_at: string
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const category = categories.includes(form.category as (typeof categories)[number])
    ? form.category
    : 'update'
  const slug = (form.slug.trim() || slugify(form.title)).slice(0, 200)
  if (!slug) return { ok: false as const, message: 'Slug o título inválido.' }

  const publishedAt =
    form.published_at.trim() || new Date().toISOString()

  const row = {
    slug,
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || null,
    content: form.content.trim() || null,
    category,
    published: form.published,
    published_at: publishedAt,
  }

  if (!row.title) return { ok: false as const, message: 'El título es obligatorio.' }

  if (form.id) {
    if (!isValidUUID(form.id)) return { ok: false as const, message: 'ID inválido.' }
    const { error } = await ctx.supabase.from('news').update(row).eq('id', form.id)
    if (error) {
      console.error('saveNews:update', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  } else {
    const { error } = await ctx.supabase.from('news').insert(row)
    if (error) {
      console.error('saveNews:insert', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  }

  revalidatePath('/admin/noticias')
  revalidatePath('/noticias')
  revalidatePath('/')
  return { ok: true as const }
}

export async function deleteNews(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!isValidUUID(id)) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('news').delete().eq('id', id)
  if (error) {
    console.error('deleteNews', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/noticias')
  revalidatePath('/noticias')
  return { ok: true as const }
}

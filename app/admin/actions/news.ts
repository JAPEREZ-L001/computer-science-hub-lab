'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { slugify } from '@/src/lib/slugify'
import { uuidSchema } from '@/src/lib/schemas/common'
import { saveNewsSchema } from '@/src/lib/schemas/admin-catalog'

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

  const parsed = saveNewsSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const slug = (parsed.data.slug.trim() || slugify(parsed.data.title)).slice(0, 200)
  if (!slug) return { ok: false as const, message: 'Slug o título inválido.' }

  const publishedAt =
    parsed.data.published_at.trim() || new Date().toISOString()

  const row = {
    slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt.trim() || null,
    content: parsed.data.content.trim() || null,
    category: parsed.data.category,
    published: parsed.data.published,
    published_at: publishedAt,
  }

  if (form.id) {
    if (!uuidSchema.safeParse(form.id).success) return { ok: false as const, message: 'ID inválido.' }
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
  // La pagina de detalle se cachea aparte del listado: sin esto, editar el
  // cuerpo de una noticia dejaba servir la version vieja en /noticias/<slug>.
  revalidatePath(`/noticias/${slug}`)
  return { ok: true as const }
}

export async function deleteNews(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!uuidSchema.safeParse(id).success) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('news').delete().eq('id', id)
  if (error) {
    console.error('deleteNews', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/noticias')
  revalidatePath('/noticias')
  revalidatePath('/')
  // Aca no tenemos el slug (la fila ya no existe), asi que se invalidan todas
  // las instancias de la ruta: sin esto la noticia borrada seguia legible en su
  // URL de detalle hasta que venciera el revalidate.
  revalidatePath('/noticias/[slug]', 'page')
  return { ok: true as const }
}

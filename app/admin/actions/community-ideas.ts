'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { uuidSchema } from '@/src/lib/schemas/common'
import {
  saveIdeaSchema,
  toggleIdeaPinnedSchema,
  updateIdeaStatusSchema,
} from '@/src/lib/schemas/admin-community'

const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

function parseTags(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[,;]+/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 5)
}

export async function saveIdea(form: {
  id: string
  title: string
  description: string
  category: string
  impact: string
  tags: string
  status: string
  execution_status: string
  execution_notes: string
  owner_id: string
  location: string
  scheduled_at: string
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const parsed = saveIdeaSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const row = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category || null,
    impact: parsed.data.impact || null,
    tags: parseTags(parsed.data.tags),
    status: parsed.data.status,
    execution_status: parsed.data.execution_status,
    execution_notes: parsed.data.execution_notes || null,
    owner_id: parsed.data.owner_id || null,
    location: parsed.data.location || null,
    scheduled_at: parsed.data.scheduled_at || null,
  }

  const { error } = await ctx.supabase
    .from('community_ideas')
    .update(row)
    .eq('id', parsed.data.id)

  if (error) {
    console.error('saveIdea', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/ideas')
  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

export async function toggleIdeaPinned(form: { id: string; pinned: boolean }) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const parsed = toggleIdeaPinnedSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const { error } = await ctx.supabase
    .from('community_ideas')
    .update({ pinned: parsed.data.pinned })
    .eq('id', parsed.data.id)

  if (error) {
    console.error('toggleIdeaPinned', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/ideas')
  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

export async function updateIdeaStatus(form: { id: string; status: string }) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const parsed = updateIdeaStatusSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const { error } = await ctx.supabase
    .from('community_ideas')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) {
    console.error('updateIdeaStatus', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/ideas')
  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

export async function deleteIdeaAdmin(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!uuidSchema.safeParse(id).success) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('community_ideas').delete().eq('id', id)
  if (error) {
    console.error('deleteIdeaAdmin', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/ideas')
  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

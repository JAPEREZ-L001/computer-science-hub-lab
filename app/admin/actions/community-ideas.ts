'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { uuidSchema } from '@/src/lib/schemas/common'
import { toggleIdeaPinnedSchema, updateIdeaStatusSchema } from '@/src/lib/schemas/admin-community'

const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

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

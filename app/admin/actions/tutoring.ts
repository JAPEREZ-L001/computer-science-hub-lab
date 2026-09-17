'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import { updateTutoringSchema } from '@/src/lib/schemas/admin-community'

const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

/**
 * No hay `deleteTutoringRequest`: el issue #33 pedía decidir si el flujo
 * necesita borrar o si alcanza con un estado de cierre. `status` ya admite
 * 'closed' (CHECK existente), así que no hace falta una policy DELETE nueva
 * ni una migración — cerrar la solicitud vía este action es suficiente.
 */
export async function updateTutoringRequest(form: {
  id: string
  status: string
  assigned_mentor_id: string
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const parsed = updateTutoringSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const row = {
    status: parsed.data.status,
    assigned_mentor_id: parsed.data.assigned_mentor_id || null,
  }

  const { error } = await ctx.supabase
    .from('tutoring_requests')
    .update(row)
    .eq('id', parsed.data.id)

  if (error) {
    console.error('updateTutoringRequest', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/tutorias')
  revalidatePath('/comunidad/tutorias')
  return { ok: true as const }
}

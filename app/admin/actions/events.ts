'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import {
  adminListEventRegistrants,
  type EventRegistrantRow,
} from '@/src/lib/supabase/admin-queries'
import { isValidUUID, sanitizeOptionalUrl } from '@/src/lib/url-validation'

const types = ['workshop', 'charla', 'hackathon', 'copa', 'networking', 'otro'] as const
const GENERIC_DB_ERROR = 'Error al guardar. Intentá de nuevo.'

export async function saveEvent(form: {
  id?: string
  title: string
  description: string
  event_date: string
  event_time: string
  speaker: string
  type: string
  location: string
  registration_url: string
  published: boolean
}) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }

  const type = types.includes(form.type as (typeof types)[number]) ? form.type : 'otro'
  const row = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    event_date: form.event_date,
    event_time: form.event_time.trim() || '09:00',
    speaker: form.speaker.trim() || null,
    type,
    location: form.location.trim() || null,
    registration_url: sanitizeOptionalUrl(form.registration_url),
    published: form.published,
  }

  if (!row.title) return { ok: false as const, message: 'El título es obligatorio.' }
  if (!row.event_date) return { ok: false as const, message: 'La fecha es obligatoria.' }

  if (form.id) {
    if (!isValidUUID(form.id)) return { ok: false as const, message: 'ID inválido.' }
    const { error } = await ctx.supabase.from('events').update(row).eq('id', form.id)
    if (error) {
      console.error('saveEvent:update', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  } else {
    // `created_by` se setea solo al crear. En el update no se toca, para que
    // editar un evento no le robe la autoría a quien lo creó.
    const { error } = await ctx.supabase
      .from('events')
      .insert({ ...row, created_by: ctx.user.id })
    if (error) {
      console.error('saveEvent:insert', error)
      return { ok: false as const, message: GENERIC_DB_ERROR }
    }
  }

  revalidatePath('/admin/eventos')
  revalidatePath('/eventos')
  return { ok: true as const }
}

/**
 * Lista los inscritos de un evento para el panel admin.
 *
 * Se carga bajo demanda al abrir el detalle en vez de venir con
 * `adminListEvents()`: la tabla de eventos solo necesita el conteo, y traer
 * todos los inscritos de todos los eventos en cada render sería innecesario.
 */
export async function listEventRegistrants(
  eventId: string,
): Promise<
  | { ok: true; registrants: EventRegistrantRow[] }
  | { ok: false; message: string }
> {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!isValidUUID(eventId)) return { ok: false as const, message: 'ID inválido.' }

  return { ok: true as const, registrants: await adminListEventRegistrants(eventId) }
}

export async function deleteEvent(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!isValidUUID(id)) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('events').delete().eq('id', id)
  if (error) {
    console.error('deleteEvent', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/eventos')
  revalidatePath('/eventos')
  return { ok: true as const }
}

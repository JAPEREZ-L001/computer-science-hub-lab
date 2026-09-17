'use server'

import { revalidatePath } from 'next/cache'

import { assertAdminAction } from '@/src/lib/supabase/admin-auth'
import {
  adminListEventRegistrants,
  type EventRegistrantRow,
} from '@/src/lib/supabase/admin-queries'
import { sanitizeOptionalUrl } from '@/src/lib/url-validation'
import { uuidSchema } from '@/src/lib/schemas/common'
import { saveEventSchema } from '@/src/lib/schemas/events'

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

  const parsed = saveEventSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const row = {
    title: parsed.data.title,
    description: parsed.data.description.trim() || null,
    event_date: parsed.data.event_date,
    event_time: parsed.data.event_time.trim() || '09:00',
    speaker: parsed.data.speaker.trim() || null,
    type: parsed.data.type,
    location: parsed.data.location.trim() || null,
    registration_url: sanitizeOptionalUrl(parsed.data.registration_url),
    published: parsed.data.published,
  }

  if (form.id) {
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
  if (!uuidSchema.safeParse(eventId).success) return { ok: false as const, message: 'ID inválido.' }

  return { ok: true as const, registrants: await adminListEventRegistrants(eventId) }
}

export async function deleteEvent(id: string) {
  const ctx = await assertAdminAction()
  if (!ctx.ok) return { ok: false as const, message: ctx.message }
  if (!uuidSchema.safeParse(id).success) return { ok: false as const, message: 'ID inválido.' }

  const { error } = await ctx.supabase.from('events').delete().eq('id', id)
  if (error) {
    console.error('deleteEvent', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/admin/eventos')
  revalidatePath('/eventos')
  return { ok: true as const }
}

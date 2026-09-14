'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/src/lib/supabase/server'
import { isValidUUID } from '@/src/lib/url-validation'

export async function deleteEvent(eventId: string) {
  if (!isValidUUID(eventId)) {
    return { ok: false as const, message: 'ID de evento inválido.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return { ok: false as const, message: 'Debés iniciar sesión para continuar.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = profile?.role === 'admin'

  const { data: event } = await supabase
    .from('events')
    .select('id, created_by')
    .eq('id', eventId)
    .maybeSingle()

  if (!event) {
    return { ok: false as const, message: 'Evento no encontrado.' }
  }

  const isCreator = event.created_by === user.id

  if (!isAdmin && !isCreator) {
    return { ok: false as const, message: 'No tenés permiso para eliminar este evento.' }
  }

  const { error } = await supabase.from('events').delete().eq('id', eventId)

  if (error) {
    console.error('deleteEvent', error)
    return { ok: false as const, message: 'No se pudo eliminar el evento.' }
  }

  revalidatePath('/eventos')
  return { ok: true as const }
}

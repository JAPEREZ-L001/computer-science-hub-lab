'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/src/lib/supabase/server'
import { isValidUUID } from '@/src/lib/url-validation'
import { notifyAdminNewRegistration } from '@/src/lib/resend'
import { formatEventDateEs, isEventPast } from '@/src/lib/event-datetime'

export async function toggleEventRegistration(eventId: string) {
  if (!isValidUUID(eventId)) {
    return { ok: false as const, message: 'Evento inválido.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) {
    return { ok: false as const, message: 'Debes iniciar sesión para inscribirte.' }
  }

  const { data: event } = await supabase
    .from('events')
    .select('id, title, event_date, published')
    .eq('id', eventId)
    .maybeSingle()

  if (!event) {
    return { ok: false as const, message: 'Evento no encontrado.' }
  }

  const { data: existing } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle()

  // Cancelar siempre se permite: si el evento se despublicó o ya pasó, el
  // usuario igual tiene que poder salirse de la lista.
  if (existing) {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)

    if (error) {
      console.error('toggleEventRegistration:delete', error)
      return { ok: false as const, message: 'Error al cancelar inscripción.' }
    }

    revalidatePath('/eventos')
    return { ok: true as const, registered: false }
  }

  // Inscribirse sí exige que el evento esté vigente. La UI ya oculta el CTA
  // en estos casos, pero la action es invocable directamente con un UUID.
  const eventDate = String(event.event_date).slice(0, 10)

  if (!event.published) {
    return {
      ok: false as const,
      message: 'Este evento no está disponible para inscripciones.',
    }
  }

  if (isEventPast({ date: eventDate })) {
    return { ok: false as const, message: 'Este evento ya finalizó.' }
  }

  const { error } = await supabase
    .from('event_registrations')
    .insert({ event_id: eventId, user_id: user.id })

  if (error) {
    console.error('toggleEventRegistration:insert', error)
    return { ok: false as const, message: 'Error al inscribirse.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  // Notificar al admin por Resend (no-blocking)
  notifyAdminNewRegistration({
    eventTitle: String(event.title),
    eventDate: formatEventDateEs(eventDate),
    userName: (profile?.full_name as string | null) ?? user.email ?? 'Miembro',
    userEmail: user.email ?? '—',
  }).catch(() => {})

  revalidatePath('/eventos')
  return { ok: true as const, registered: true }
}

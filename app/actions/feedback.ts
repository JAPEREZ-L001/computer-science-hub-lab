'use server'

import { headers } from 'next/headers'

import { createClient } from '@/src/lib/supabase/server'
import { notifyAdminFeedback } from '@/src/lib/resend'
import { checkRateLimit } from '@/src/lib/rate-limiter'

const ANON_RATE_LIMIT = 75 // máximo de envíos por hora para usuarios anónimos

export async function submitFeedback(form: { name: string; email: string; message: string }) {
  const name = form.name?.trim()
  const email = form.email?.trim()
  const message = form.message?.trim()

  if (!name || !email || !message) {
    return { ok: false as const, message: 'Completá todos los campos.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { ok: false as const, message: 'Correo electrónico inválido.' }
  }

  if (message.length < 10) {
    return { ok: false as const, message: 'El mensaje es muy corto (mínimo 10 caracteres).' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAnonymous = !user || user.is_anonymous

  // Rate limiting solo para usuarios anónimos
  if (isAnonymous) {
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'

    const rl = checkRateLimit(`feedback:${ip}`, ANON_RATE_LIMIT)
    if (!rl.allowed) {
      return {
        ok: false as const,
        message: 'Has enviado demasiados mensajes. Intentá de nuevo en un momento.',
      }
    }
  }

  // Insertar en la tabla feedback
  const { error } = await supabase
    .from('feedback')
    .insert({
      name,
      email,
      message,
      is_anonymous: isAnonymous,
    })

  if (error) {
    console.error('submitFeedback:insert', error)
    return { ok: false as const, message: 'Error al guardar tu opinión.' }
  }

  // Notificar al admin — indicar si el remitente es anónimo
  await notifyAdminFeedback({
    userName: isAnonymous ? `[Anónimo] ${name}` : name,
    userEmail: email,
    message,
  })

  return { ok: true as const }
}

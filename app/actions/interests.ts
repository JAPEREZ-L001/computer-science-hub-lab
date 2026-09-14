'use server'

import { z } from 'zod'

import { createClient } from '@/src/lib/supabase/server'

const VALID_GOALS = ['apoyo', 'comunidad', 'profesional'] as const
type Goal = (typeof VALID_GOALS)[number]

const MAX_NAME_LENGTH = 100
const MAX_DETAIL_LENGTH = 1000

const emailSchema = z.string().email().max(254)

export async function submitInterest(form: {
  name: string
  email: string
  goals: string[]
  detail: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const goals = form.goals.filter((g): g is Goal => VALID_GOALS.includes(g as Goal))
  if (goals.length === 0) {
    return { ok: false as const, message: 'Seleccioná al menos una opción.' }
  }

  const name = form.name.trim().slice(0, MAX_NAME_LENGTH) || null
  const detail = form.detail.trim().slice(0, MAX_DETAIL_LENGTH) || null

  const emailRaw = form.email.trim()
  const emailParsed = emailSchema.safeParse(emailRaw)
  const email = emailParsed.success ? emailParsed.data : null

  if (emailRaw && !emailParsed.success) {
    return { ok: false as const, message: 'El email ingresado no es válido.' }
  }

  const userId = user && !user.is_anonymous ? user.id : null

  if (userId) {
    const { count } = await supabase
      .from('member_interests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) > 0) {
      return { ok: false as const, message: 'Ya enviaste tu interés anteriormente. Nos pondremos en contacto pronto.' }
    }
  }

  const { error } = await supabase.from('member_interests').insert({
    user_id: userId,
    name,
    email,
    goals,
    detail,
  })

  if (error) {
    console.error('submitInterest', error)
    return { ok: false as const, message: 'No se pudo guardar. Intentá de nuevo.' }
  }

  return { ok: true as const }
}


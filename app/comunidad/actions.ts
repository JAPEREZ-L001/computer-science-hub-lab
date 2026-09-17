'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/src/lib/supabase/server'
import { checkRateLimit } from '@/src/lib/rate-limiter'
import { isValidUUID } from '@/src/lib/url-validation'
import {
  IDEA_CATEGORIES,
  IDEA_IMPACTS,
  type IdeaCategory,
  type IdeaImpact,
} from '@/src/types'
import {
  updateMentorSessionSchema,
  updateReinforcementTopicsSchema,
} from '@/src/lib/schemas/tutoring'

const GENERIC_DB_ERROR = 'Ocurrió un error. Intentá de nuevo más tarde.'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) {
    return { ok: false as const, message: 'Iniciá sesión para continuar.', user: null, supabase: null }
  }
  return { ok: true as const, user, supabase }
}

export async function submitTutoringRequest(form: {
  topic: string
  details: string
  preferred_schedule: string
}) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  const topic = form.topic.trim()
  if (!topic) return { ok: false as const, message: 'Indicá un tema o materia.' }

  const { error } = await ctx.supabase.from('tutoring_requests').insert({
    user_id: ctx.user.id,
    topic,
    details: form.details.trim() || null,
    preferred_schedule: form.preferred_schedule.trim() || null,
    status: 'pending',
  })

  if (error) {
    console.error('submitTutoringRequest', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/tutorias')
  return { ok: true as const }
}

/**
 * El alumno edita los temas que quiere reforzar, incluso después del match: es
 * justo cuando ya sabe con quién va y puede afinar el pedido.
 *
 * El `.eq('user_id')` es redundante con la RLS y con el trigger
 * `tutoring_requests_guard_columns`; se deja porque hace explícito el alcance
 * en el mismo lugar donde se lee el código.
 */
export async function updateReinforcementTopics(form: {
  id: string
  reinforcement_topics: string
}) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  const parsed = updateReinforcementTopicsSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const { error } = await ctx.supabase
    .from('tutoring_requests')
    .update({ reinforcement_topics: parsed.data.reinforcement_topics || null })
    .eq('id', parsed.data.id)
    .eq('user_id', ctx.user.id)

  if (error) {
    console.error('updateReinforcementTopics', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/tutorias')
  return { ok: true as const }
}

/** El mentor agenda la sesión (aula y horario) y deja el seguimiento. */
export async function updateMentorSession(form: {
  id: string
  session_location: string
  session_at: string
  mentor_notes: string
  status: string
}) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  const parsed = updateMentorSessionSchema.safeParse(form)
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? GENERIC_DB_ERROR }
  }

  const { error } = await ctx.supabase
    .from('tutoring_requests')
    .update({
      session_location: parsed.data.session_location || null,
      session_at: parsed.data.session_at || null,
      mentor_notes: parsed.data.mentor_notes || null,
      status: parsed.data.status,
    })
    .eq('id', parsed.data.id)
    .eq('assigned_mentor_id', ctx.user.id)

  if (error) {
    console.error('updateMentorSession', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/tutorias')
  return { ok: true as const }
}

export async function voteCommunityIdea(ideaId: string) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  if (!isValidUUID(ideaId)) {
    return { ok: false as const, message: 'ID de idea inválido.' }
  }

  const { error: rpcErr } = await ctx.supabase.rpc('cast_idea_vote', {
    p_idea_id: ideaId,
  })

  if (rpcErr) {
    const dup =
      rpcErr.code === '23505' || /duplicate key/i.test(rpcErr.message ?? '')
    if (dup) {
      return { ok: false as const, message: 'Ya votaste esta idea.' }
    }
    console.error('voteCommunityIdea:rpc', rpcErr)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

export async function proposeCommunityIdea(form: {
  title: string
  description: string
  tags?: string
  category?: string
  impact?: string
}) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  const title = form.title.trim()
  if (!title) return { ok: false as const, message: 'El título es obligatorio.' }

  const category = IDEA_CATEGORIES.includes(form.category as IdeaCategory)
    ? (form.category as IdeaCategory)
    : null
  const impact = IDEA_IMPACTS.includes(form.impact as IdeaImpact)
    ? (form.impact as IdeaImpact)
    : null

  const tags = (form.tags ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5)

  const { error } = await ctx.supabase.from('community_ideas').insert({
    title,
    description: form.description.trim() || null,
    author_id: ctx.user.id,
    vote_count: 0,
    status: 'open',
    tags,
    category,
    impact,
  })

  if (error) {
    console.error('proposeCommunityIdea', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

export async function deleteOwnIdea(ideaId: string) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  if (!isValidUUID(ideaId)) {
    return { ok: false as const, message: 'ID de idea inválido.' }
  }

  // Only the author can delete their own idea
  const { error } = await ctx.supabase
    .from('community_ideas')
    .delete()
    .eq('id', ideaId)
    .eq('author_id', ctx.user.id)

  if (error) {
    console.error('deleteOwnIdea', error)
    return { ok: false as const, message: 'No se pudo eliminar la idea.' }
  }

  revalidatePath('/comunidad/ideas')
  return { ok: true as const }
}

export async function deleteMentorProfile() {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  const { error } = await ctx.supabase
    .from('mentor_matching_profiles')
    .delete()
    .eq('user_id', ctx.user.id)

  if (error) {
    console.error('deleteMentorProfile', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/mentores')
  return { ok: true as const }
}

export async function saveMentorMatchingProfile(form: {
  role: string
  topics: string
  availability: string
  bio_short: string
  active: boolean
}) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  const role = form.role === 'mentor' || form.role === 'student' || form.role === 'both' ? form.role : 'student'

  const { error } = await ctx.supabase.from('mentor_matching_profiles').upsert(
    {
      user_id: ctx.user.id,
      role,
      topics: form.topics.trim() || null,
      availability: form.availability.trim() || null,
      bio_short: form.bio_short.trim() || null,
      active: form.active,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    console.error('saveMentorMatchingProfile', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  revalidatePath('/comunidad/mentores')
  revalidatePath('/comunidad/tutorias')
  return { ok: true as const }
}

const FORUM_MESSAGE_RATE_LIMIT = 20 // mensajes por hora por usuario
const FORUM_MESSAGE_MAX_LENGTH = 2000

/**
 * No hace `revalidatePath`: el mensaje aparece via la suscripcion de
 * Realtime del propio ForumBoard, no por un refresh de la pagina. Eso es
 * justamente lo que evita la latencia de un round-trip servidor-cliente
 * completo por cada mensaje.
 */
export async function sendForumMessage(channelId: string, content: string) {
  const ctx = await requireUser()
  if (!ctx.ok || !ctx.user || !ctx.supabase) return { ok: false as const, message: ctx.message }

  if (!isValidUUID(channelId)) {
    return { ok: false as const, message: 'Canal inválido.' }
  }

  const trimmed = content.trim()
  if (!trimmed) {
    return { ok: false as const, message: 'Escribí algo antes de enviar.' }
  }
  if (trimmed.length > FORUM_MESSAGE_MAX_LENGTH) {
    return { ok: false as const, message: `El mensaje es demasiado largo (máximo ${FORUM_MESSAGE_MAX_LENGTH} caracteres).` }
  }

  const rl = checkRateLimit(`forum:${ctx.user.id}`, FORUM_MESSAGE_RATE_LIMIT)
  if (!rl.allowed) {
    return { ok: false as const, message: 'Estás enviando mensajes muy rápido. Esperá un momento e intentá de nuevo.' }
  }

  const { error } = await ctx.supabase.from('forum_messages').insert({
    channel_id: channelId,
    author_id: ctx.user.id,
    content: trimmed,
  })

  if (error) {
    console.error('sendForumMessage', error)
    return { ok: false as const, message: GENERIC_DB_ERROR }
  }

  return { ok: true as const }
}

'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/src/lib/supabase/server'
import { isValidUUID } from '@/src/lib/url-validation'
import {
  IDEA_CATEGORIES,
  IDEA_IMPACTS,
  type IdeaCategory,
  type IdeaImpact,
} from '@/src/types'

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

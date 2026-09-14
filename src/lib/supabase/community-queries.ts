import { DISPLAY_NAME_FALLBACK, resolveDisplayName } from '@/src/lib/display-name'
import { createClient } from '@/src/lib/supabase/server'
import type { IdeaCategory, IdeaImpact } from '@/src/types'

export type HubDocumentRow = {
  id: string
  title: string
  description: string | null
  url: string
  category: string
  sort_order: number
}

export type PodcastEpisodeRow = {
  id: string
  title: string
  summary: string | null
  episode_url: string
  platform: string
  published_at: string | null
  sort_order: number
}

export type ResearchPublicationRow = {
  id: string
  title: string
  authors: string | null
  venue: string | null
  year: number | null
  url: string | null
  sort_order: number
}

export type LeaderboardRow = {
  id: string
  display_name: string
  points: number
  badge: string | null
  area: string | null
  sort_order: number
}

export type IdeaVoterRow = {
  user_id: string
  display_name: string
}

export type CommunityIdeaRow = {
  id: string
  title: string
  description: string | null
  vote_count: number
  created_at: string
  author_id: string | null
  /**
   * `null` cuando la idea no tiene autor (las 3 del seed inicial) — distinto de
   * tenerlo pero no poder resolverlo, que cae en `DISPLAY_NAME_FALLBACK`. La UI
   * usa esa diferencia para omitir la línea en vez de escribir "Propuesta por
   * Miembro".
   */
  author_name: string | null
  tags: string[]
  category: IdeaCategory | null
  impact: IdeaImpact | null
  voters?: IdeaVoterRow[]
}

export type TutoringRequestRow = {
  id: string
  topic: string
  details: string | null
  preferred_schedule: string | null
  status: string
  created_at: string
}

export type MentorProfileRow = {
  user_id: string
  role: string
  topics: string | null
  availability: string | null
  bio_short: string | null
  display_name?: string
}

export async function fetchHubDocuments(): Promise<HubDocumentRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hub_documents')
    .select('id, title, description, url, category, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(100)

  if (error) {
    console.error('fetchHubDocuments', error)
    return []
  }
  return (data ?? []) as HubDocumentRow[]
}

export async function fetchPodcastEpisodes(): Promise<PodcastEpisodeRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('podcast_episodes')
    .select('id, title, summary, episode_url, platform, published_at, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(100)

  if (error) {
    console.error('fetchPodcastEpisodes', error)
    return []
  }
  return (data ?? []) as PodcastEpisodeRow[]
}

export async function fetchResearchPublications(): Promise<ResearchPublicationRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('research_publications')
    .select('id, title, authors, venue, year, url, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(100)

  if (error) {
    console.error('fetchResearchPublications', error)
    return []
  }
  return (data ?? []) as ResearchPublicationRow[]
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_leaderboard')
    .select('id, display_name, points, badge, area, sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(100)

  if (error) {
    console.error('fetchLeaderboard', error)
    return []
  }
  return (data ?? []) as LeaderboardRow[]
}

export type MemberLeaderboardRow = {
  user_id: string
  display_name: string
  points: number
  badge: string | null
  area: string | null
}

/**
 * Ranking de miembros reales por `profiles.reputation_score`.
 *
 * Reemplaza a `fetchLeaderboard()`, que leía `community_leaderboard`: una tabla
 * curada a mano cuyas filas son colectivos inventados ("Equipo demo Frontend").
 *
 * Se excluye a quien tiene 0 puntos en vez de rellenar la tabla con empates:
 * un ranking donde nadie puntuó debe verse vacío, no plano. Con la tabla vacía
 * la página muestra su estado correspondiente.
 */
export async function fetchMemberLeaderboard(limit = 25): Promise<MemberLeaderboardRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, reputation_score, badge, area')
    .eq('status', 'activo')
    .gt('reputation_score', 0)
    .order('reputation_score', { ascending: false })
    // Desempate estable: sin esto, dos personas con los mismos puntos podían
    // intercambiar posiciones entre recargas.
    .order('full_name', { ascending: true, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('fetchMemberLeaderboard', error)
    return []
  }

  return (data ?? []).map((row) => ({
    user_id: row.id as string,
    display_name: resolveDisplayName({ full_name: row.full_name as string | null }),
    points: (row.reputation_score as number | null) ?? 0,
    badge: row.badge as string | null,
    area: row.area as string | null,
  }))
}

/**
 * Nombres visibles de un conjunto de usuarios, en una sola consulta.
 *
 * Solo se pide `full_name`: el RLS de `profiles` ya limita el resultado a los
 * perfiles con `status = 'activo'` (más el propio y los de admin), así que un
 * id que no vuelva cae al fallback sin que haya que filtrar acá.
 */
async function fetchDisplayNamesByUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)
    .limit(500)

  if (error) {
    console.error('fetchDisplayNamesByUserId', error)
    return new Map()
  }

  return new Map(
    (data ?? []).map((p) => [
      p.id as string,
      resolveDisplayName({ full_name: p.full_name as string | null }),
    ]),
  )
}

export type IdeaStatusFilter = 'open' | 'closed' | 'all'

/**
 * `status` por defecto es 'open' para no cambiar el comportamiento existente.
 * RLS (`ideas_select_open_or_admin`) igual limita 'closed'/'all' a admins —
 * un usuario sin ese rol que pida 'closed' simplemente recibe una lista vacía,
 * no un error.
 */
export async function fetchCommunityIdeas(status: IdeaStatusFilter = 'open'): Promise<CommunityIdeaRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('community_ideas')
    .select('id, title, description, vote_count, created_at, author_id, tags, category, impact')

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
    .order('vote_count', { ascending: false })
    .limit(200)

  if (error) {
    console.error('fetchCommunityIdeas', error)
    return []
  }

  const ideas = (data ?? []) as CommunityIdeaRow[]
  if (ideas.length === 0) return ideas

  const ideaIds = ideas.map((i) => i.id)

  const { data: votes } = await supabase
    .from('community_idea_votes')
    .select('idea_id, user_id')
    .in('idea_id', ideaIds)
    .limit(500)

  // Sin votos visibles las ideas se sirven igual, solo sin la fila de avatares.
  // Antes se retornaba acá, lo que dejaba también sin resolver el autor.
  const voteRows = (votes ?? []) as { idea_id: string; user_id: string }[]

  const authorIds = ideas
    .map((idea) => idea.author_id)
    .filter((id): id is string => Boolean(id))

  // Autores y votantes en la misma consulta: son el mismo tipo de dato y suelen
  // solaparse (quien propone una idea normalmente la vota).
  const nameById = await fetchDisplayNamesByUserId(supabase, [
    ...new Set([...authorIds, ...voteRows.map((v) => v.user_id)]),
  ])

  const votersByIdeaId = new Map<string, IdeaVoterRow[]>()
  for (const vote of voteRows) {
    if (!votersByIdeaId.has(vote.idea_id)) votersByIdeaId.set(vote.idea_id, [])
    const list = votersByIdeaId.get(vote.idea_id)!
    if (list.length < 5) {
      list.push({
        user_id: vote.user_id,
        display_name: nameById.get(vote.user_id) ?? DISPLAY_NAME_FALLBACK,
      })
    }
  }

  return ideas.map((idea) => ({
    ...idea,
    author_name: idea.author_id
      ? (nameById.get(idea.author_id) ?? DISPLAY_NAME_FALLBACK)
      : null,
    voters: votersByIdeaId.get(idea.id) ?? [],
  }))
}

export async function fetchIdeaVotesForUser(userId: string): Promise<Set<string>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_idea_votes')
    .select('idea_id')
    .eq('user_id', userId)
    .limit(500)

  if (error || !data) {
    return new Set()
  }
  return new Set(data.map((r) => r.idea_id as string))
}

export async function fetchTutoringRequestsForUser(userId: string): Promise<TutoringRequestRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tutoring_requests')
    .select('id, topic, details, preferred_schedule, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('fetchTutoringRequestsForUser', error)
    return []
  }
  return (data ?? []) as TutoringRequestRow[]
}

export type MentorOwnProfileRow = {
  user_id: string
  role: string
  topics: string | null
  availability: string | null
  bio_short: string | null
  active: boolean
}

export async function fetchMentorProfileForUser(userId: string): Promise<MentorOwnProfileRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentor_matching_profiles')
    .select('user_id, role, topics, availability, bio_short, active')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return {
    user_id: data.user_id as string,
    role: data.role as string,
    topics: data.topics as string | null,
    availability: data.availability as string | null,
    bio_short: data.bio_short as string | null,
    active: Boolean(data.active),
  }
}

export async function fetchMentorDirectory(): Promise<MentorProfileRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentor_matching_profiles')
    .select('user_id, role, topics, availability, bio_short')
    .eq('active', true)
    .in('role', ['mentor', 'both'])
    .limit(200)

  if (error || !data) {
    console.error('fetchMentorDirectory', error)
    return []
  }

  const ids = data.map((r) => r.user_id as string)
  if (ids.length === 0) return []

  const nameById = await fetchDisplayNamesByUserId(supabase, ids)

  return data.map((row) => ({
    user_id: row.user_id as string,
    role: row.role as string,
    topics: row.topics as string | null,
    availability: row.availability as string | null,
    bio_short: row.bio_short as string | null,
    display_name: nameById.get(row.user_id as string),
  }))
}

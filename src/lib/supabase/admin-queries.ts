import { DISPLAY_NAME_FALLBACK, resolveDisplayName } from '@/src/lib/display-name'
import { createClient } from '@/src/lib/supabase/server'

export type NewsAdminRow = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  category: string
  published: boolean
  published_at: string | null
}

export type EventAdminRow = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  speaker: string | null
  type: string
  location: string | null
  registration_url: string | null
  published: boolean
  created_by: string | null
  /** Inscritos en `event_registrations`. Derivado, no es una columna de `events`. */
  registrations_count: number
}

export type OpportunityAdminRow = {
  id: string
  title: string
  organization: string
  description: string | null
  url: string | null
  type: string
  published: boolean
}

export type ResourceAdminRow = {
  id: string
  title: string
  description: string | null
  url: string | null
  category: string
  tags: string[] | null
  published: boolean
}

export type SponsorAdminRow = {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  tier: string
  active: boolean
}

export type ProfileAdminRow = {
  id: string
  full_name: string | null
  email: string | null
  career: string | null
  cycle: number | null
  area: string | null
  status: string | null
  role: string | null
  bio: string | null
  github_url: string | null
  linkedin_url: string | null
  created_at: string | null
}

export async function adminListNews(): Promise<NewsAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select('id, slug, title, excerpt, content, category, published, published_at')
    .order('published_at', { ascending: false, nullsFirst: true })

  if (error) {
    console.error('adminListNews', error)
    return []
  }
  return (data ?? []) as NewsAdminRow[]
}

export async function adminListEvents(): Promise<EventAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, description, event_date, event_time, speaker, type, location, registration_url, published, created_by, event_registrations(count)',
    )
    .order('event_date', { ascending: false })

  if (error) {
    console.error('adminListEvents', error)
    return []
  }

  return (data ?? []).map((row) => {
    const { event_registrations: regs, ...event } = row as typeof row & {
      event_registrations?: { count: number }[]
    }
    return {
      ...event,
      registrations_count: regs?.[0]?.count ?? 0,
    } as EventAdminRow
  })
}

export type EventRegistrantRow = {
  user_id: string
  display_name: string
  email: string | null
  career: string | null
  registered_at: string
  /**
   * `true` cuando la inscripción no tiene fila en `profiles`. El panel lo marca
   * en vez de mostrar "Miembro" a secas, porque significa que hay que reconciliar
   * el perfil (ver `reconcile_missing_profiles()`), no que la persona no tenga
   * nombre.
   */
  profile_missing: boolean
}

/**
 * Inscritos a un evento, con su nombre real.
 *
 * `event_registrations.user_id` referencia a `auth.users`, no a `profiles`, así
 * que PostgREST no puede embeber el perfil: hay que resolverlo en una segunda
 * consulta. La policy `event_reg_select_admin` ya permite al admin leer todas
 * las filas, y `profiles_select_policy` le permite leer cualquier perfil
 * (incluidos los inactivos), así que no hace falta migración para esto.
 */
export async function adminListEventRegistrants(
  eventId: string,
): Promise<EventRegistrantRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .select('user_id, registered_at')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: true })
    .limit(500)

  if (error) {
    console.error('adminListEventRegistrants', error)
    return []
  }

  const registrations = (data ?? []) as { user_id: string; registered_at: string }[]
  if (registrations.length === 0) return []

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email, career')
    .in(
      'id',
      registrations.map((r) => r.user_id),
    )
    .limit(500)

  if (profilesError) {
    console.error('adminListEventRegistrants:profiles', profilesError)
  }

  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id as string,
      {
        full_name: p.full_name as string | null,
        email: p.email as string | null,
        career: p.career as string | null,
      },
    ]),
  )

  return registrations.map((registration) => {
    const profile = profileById.get(registration.user_id)
    return {
      user_id: registration.user_id,
      display_name: resolveDisplayName({
        full_name: profile?.full_name,
        email: profile?.email,
      }),
      email: profile?.email ?? null,
      career: profile?.career ?? null,
      registered_at: registration.registered_at,
      profile_missing: !profile,
    }
  })
}

export async function adminListOpportunities(): Promise<OpportunityAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, organization, description, url, type, published')
    .order('title', { ascending: true })

  if (error) {
    console.error('adminListOpportunities', error)
    return []
  }
  return (data ?? []) as OpportunityAdminRow[]
}

export async function adminListResources(): Promise<ResourceAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, description, url, category, tags, published')
    .order('title', { ascending: true })

  if (error) {
    console.error('adminListResources', error)
    return []
  }
  return (data ?? []) as ResourceAdminRow[]
}

export async function adminListSponsors(): Promise<SponsorAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sponsors')
    .select('id, name, logo_url, website_url, tier, active')
    .order('name', { ascending: true })

  if (error) {
    console.error('adminListSponsors', error)
    return []
  }
  return (data ?? []) as SponsorAdminRow[]
}

export async function adminListProfiles(): Promise<ProfileAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, career, cycle, area, status, role, bio, github_url, linkedin_url, created_at',
    )
    .order('created_at', { ascending: false, nullsFirst: true })

  if (error) {
    console.error('adminListProfiles', error)
    return []
  }
  return (data ?? []) as ProfileAdminRow[]
}

export type CommunityIdeaAdminRow = {
  id: string
  title: string
  description: string | null
  author_id: string | null
  author_name: string
  vote_count: number
  status: string
  pinned: boolean
  category: string | null
  impact: string | null
  tags: string[]
  execution_status: string
  execution_notes: string | null
  owner_id: string | null
  owner_name: string | null
  location: string | null
  scheduled_at: string | null
  created_at: string
}

/**
 * Autor y responsable se resuelven solo por nombre, nunca por email: mismo
 * criterio que `resolveDisplayName` documenta para ideas en el resto del sitio
 * (ver `display-name.ts`), y acá no hace falta romperlo para moderar.
 */
export async function adminListCommunityIdeas(): Promise<CommunityIdeaAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_ideas')
    .select(
      'id, title, description, author_id, vote_count, status, pinned, category, impact, tags, execution_status, execution_notes, owner_id, location, scheduled_at, created_at',
    )
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('adminListCommunityIdeas', error)
    return []
  }

  const rows = (data ?? []) as Omit<CommunityIdeaAdminRow, 'author_name' | 'owner_name'>[]
  const personIds = [
    ...new Set(
      [...rows.map((r) => r.author_id), ...rows.map((r) => r.owner_id)].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  ]

  const nameById = new Map<string, string | null>()
  if (personIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', personIds)

    if (profilesError) console.error('adminListCommunityIdeas:profiles', profilesError)
    for (const p of profiles ?? []) nameById.set(p.id as string, p.full_name as string | null)
  }

  return rows.map((r) => ({
    ...r,
    author_name: r.author_id
      ? resolveDisplayName({ full_name: nameById.get(r.author_id) })
      : DISPLAY_NAME_FALLBACK,
    owner_name: r.owner_id
      ? resolveDisplayName({ full_name: nameById.get(r.owner_id) })
      : null,
  }))
}

/**
 * Miembros asignables como responsables de una idea. A diferencia de los
 * mentores (que salen del directorio opt-in), cualquier miembro activo puede
 * quedar a cargo de ejecutar una idea.
 */
export async function adminListAssignableMembers(): Promise<MentorCandidateRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('status', 'activo')

  if (error) {
    console.error('adminListAssignableMembers', error)
    return []
  }

  return (data ?? [])
    .map((p) => ({
      id: p.id as string,
      name: resolveDisplayName({
        full_name: p.full_name as string | null,
        email: p.email as string | null,
      }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export type TutoringRequestAdminRow = {
  id: string
  user_id: string
  requester_name: string
  requester_email: string | null
  topic: string
  details: string | null
  preferred_schedule: string | null
  status: string
  assigned_mentor_id: string | null
  assigned_mentor_name: string | null
  session_location: string | null
  session_at: string | null
  mentor_notes: string | null
  reinforcement_topics: string | null
  created_at: string
}

/**
 * Acá sí se resuelve el email del solicitante: a diferencia de una idea (donde
 * cualquier miembro autenticado puede ver al autor), esta lista solo la ve un
 * admin, que ya tiene acceso al email de cualquiera desde `/admin/miembros`.
 */
export async function adminListTutoringRequests(): Promise<TutoringRequestAdminRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tutoring_requests')
    .select(
      'id, user_id, topic, details, preferred_schedule, status, assigned_mentor_id, session_location, session_at, mentor_notes, reinforcement_topics, created_at',
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('adminListTutoringRequests', error)
    return []
  }

  const rows = (data ?? []) as Omit<
    TutoringRequestAdminRow,
    'requester_name' | 'requester_email' | 'assigned_mentor_name'
  >[]

  const profileIds = [
    ...new Set([
      ...rows.map((r) => r.user_id),
      ...rows.map((r) => r.assigned_mentor_id).filter((id): id is string => Boolean(id)),
    ]),
  ]

  const profileById = new Map<string, { full_name: string | null; email: string | null }>()
  if (profileIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', profileIds)

    if (profilesError) console.error('adminListTutoringRequests:profiles', profilesError)
    for (const p of profiles ?? [])
      profileById.set(p.id as string, {
        full_name: p.full_name as string | null,
        email: p.email as string | null,
      })
  }

  return rows.map((r) => {
    const requester = profileById.get(r.user_id)
    const mentor = r.assigned_mentor_id ? profileById.get(r.assigned_mentor_id) : undefined
    return {
      ...r,
      requester_name: resolveDisplayName({
        full_name: requester?.full_name,
        email: requester?.email,
      }),
      requester_email: requester?.email ?? null,
      assigned_mentor_name: mentor
        ? resolveDisplayName({ full_name: mentor.full_name, email: mentor.email })
        : null,
    }
  })
}

export type MentorCandidateRow = {
  id: string
  name: string
}

/**
 * Candidatos para `assigned_mentor_id`: perfiles con `mentor_matching_profiles`
 * activo en rol mentor o both. La policy de esa tabla ya deja leer estas filas
 * a cualquier autenticado (es el directorio de mentores), así que no hace
 * falta una policy nueva para que el admin las liste.
 */
export async function adminListMentorCandidates(): Promise<MentorCandidateRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentor_matching_profiles')
    .select('user_id')
    .eq('active', true)
    .in('role', ['mentor', 'both'])

  if (error) {
    console.error('adminListMentorCandidates', error)
    return []
  }

  const ids = (data ?? []).map((r) => r.user_id as string)
  if (ids.length === 0) return []

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', ids)

  if (profilesError) {
    console.error('adminListMentorCandidates:profiles', profilesError)
    return []
  }

  return (profiles ?? [])
    .map((p) => ({
      id: p.id as string,
      name: resolveDisplayName({ full_name: p.full_name as string | null, email: p.email as string | null }),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function adminCounts() {
  const supabase = await createClient()
  const [news, events, opps, resources, sponsors, profiles, registrations, ideas, tutoring] =
    await Promise.all([
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('opportunities').select('id', { count: 'exact', head: true }),
      supabase.from('resources').select('id', { count: 'exact', head: true }),
      supabase.from('sponsors').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('event_registrations').select('event_id', { count: 'exact', head: true }),
      supabase.from('community_ideas').select('id', { count: 'exact', head: true }),
      // Solo las que esperan acción: una tutoría cerrada ya no requiere gestión,
      // y el resumen sirve para saber qué falta atender.
      supabase
        .from('tutoring_requests')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'closed'),
    ])
  return {
    news: news.count ?? 0,
    events: events.count ?? 0,
    opportunities: opps.count ?? 0,
    resources: resources.count ?? 0,
    sponsors: sponsors.count ?? 0,
    profiles: profiles.count ?? 0,
    registrations: registrations.count ?? 0,
    ideas: ideas.count ?? 0,
    tutoring: tutoring.count ?? 0,
  }
}

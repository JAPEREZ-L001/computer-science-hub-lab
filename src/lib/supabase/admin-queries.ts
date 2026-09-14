import { resolveDisplayName } from '@/src/lib/display-name'
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

export async function adminCounts() {
  const supabase = await createClient()
  const [news, events, opps, resources, sponsors, profiles, registrations] =
    await Promise.all([
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('opportunities').select('id', { count: 'exact', head: true }),
      supabase.from('resources').select('id', { count: 'exact', head: true }),
      supabase.from('sponsors').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('event_registrations').select('event_id', { count: 'exact', head: true }),
    ])
  return {
    news: news.count ?? 0,
    events: events.count ?? 0,
    opportunities: opps.count ?? 0,
    resources: resources.count ?? 0,
    sponsors: sponsors.count ?? 0,
    profiles: profiles.count ?? 0,
    registrations: registrations.count ?? 0,
  }
}

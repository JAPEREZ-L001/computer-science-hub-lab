import { resolveDisplayName } from '@/src/lib/display-name'
import { createClient } from '@/src/lib/supabase/server'
import type {
  HubEvent,
  HubEventType,
  MemberArea,
  MemberProfile,
  MemberStatus,
  NewsCategory,
  NewsPost,
  Sponsor,
  SponsorTier,
  UserBadge,
  UniversityRole,
  UniversityCode,
} from '@/src/types'

function isMemberArea(v: string): v is MemberArea {
  return (
    v === 'frontend' ||
    v === 'backend' ||
    v === 'diseño' ||
    v === 'devops' ||
    v === 'ia' ||
    v === 'ciberseguridad' ||
    v === 'robótica' ||
    v === 'juegos' ||
    v === 'general'
  )
}

function isMemberStatus(v: string): v is MemberStatus {
  return v === 'activo' || v === 'inactivo'
}

function isNewsCategory(v: string): v is NewsCategory {
  return v === 'anuncio' || v === 'logro' || v === 'evento' || v === 'update'
}

function isHubEventType(v: string): v is HubEventType {
  return (
    v === 'workshop' ||
    v === 'charla' ||
    v === 'hackathon' ||
    v === 'copa' ||
    v === 'networking' ||
    v === 'otro'
  )
}

function isSponsorTier(v: string): v is SponsorTier {
  return v === 'principal' || v === 'colaborador' || v === 'aliado'
}

const VALID_BADGES: readonly string[] = [
  'ceo_founder', 'primary_agent', 'primary_fellow',
  'agent', 'member', 'fellow', 'catedratico', 'estudiante',
]
function isUserBadge(v: string): v is UserBadge {
  return VALID_BADGES.includes(v)
}
function isUniversityRole(v: string): v is UniversityRole {
  return v === 'estudiante' || v === 'catedratico'
}
const VALID_UNIVERSITIES: readonly string[] = ['UDB', 'UCA', 'UES', 'UFG', 'UEES', 'ESEN']
function isUniversityCode(v: string): v is UniversityCode {
  return VALID_UNIVERSITIES.includes(v)
}

export function mapProfileRow(row: {
  id: string
  full_name: string | null
  email: string | null
  career: string | null
  cycle: number | null
  area: string | null
  status: string | null
  bio?: string | null
  github_url?: string | null
  linkedin_url?: string | null
  created_at?: string | null
  onboarding_completed?: boolean | null
  reputation_score?: number | null
  avatar_palette_index?: number | null
  banner_palette_index?: number | null
  badge?: string | null
  university_role?: string | null
  university?: string | null
}): MemberProfile {
  const areaRaw = row.area ?? 'general'
  const area: MemberArea = isMemberArea(areaRaw) ? areaRaw : 'general'
  const statusRaw = row.status ?? 'inactivo'
  const status: MemberStatus = isMemberStatus(statusRaw) ? statusRaw : 'inactivo'
  const name = resolveDisplayName({ full_name: row.full_name, email: row.email })
  const joinedAt = row.created_at
    ? row.created_at.slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const badgeRaw = row.badge ?? 'member'
  const badge: UserBadge = isUserBadge(badgeRaw) ? badgeRaw : 'member'
  const universityRoleRaw = row.university_role ?? 'estudiante'
  const universityRole: UniversityRole = isUniversityRole(universityRoleRaw) ? universityRoleRaw : 'estudiante'
  const universityRaw = row.university ?? 'UDB'
  const university: UniversityCode = isUniversityCode(universityRaw) ? universityRaw : 'UDB'

  return {
    id: row.id,
    name,
    career: row.career?.trim() || '—',
    cycle: typeof row.cycle === 'number' && !Number.isNaN(row.cycle) ? row.cycle : 1,
    area,
    bio: row.bio?.trim() || undefined,
    github: row.github_url?.trim() || undefined,
    linkedin: row.linkedin_url?.trim() || undefined,
    status,
    joinedAt,
    onboardingCompleted: row.onboarding_completed ?? false,
    reputationScore: row.reputation_score ?? 0,
    avatarPaletteIndex: row.avatar_palette_index ?? null,
    bannerPaletteIndex: row.banner_palette_index ?? null,
    badge,
    universityRole,
    university,
  }
}

export async function fetchActiveProfiles(): Promise<MemberProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, career, cycle, area, status, bio, github_url, linkedin_url, created_at, onboarding_completed, reputation_score, avatar_palette_index, banner_palette_index, badge, university_role, university',
    )
    .eq('status', 'activo')
    .order('full_name', { ascending: true, nullsFirst: false })
    .limit(500)

  if (error || !data) {
    console.error('fetchActiveProfiles', error)
    return []
  }

  return data.map((row) => mapProfileRow(row as Parameters<typeof mapProfileRow>[0]))
}

export async function fetchProfileByUserId(userId: string): Promise<MemberProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, career, cycle, area, status, bio, github_url, linkedin_url, created_at, onboarding_completed, reputation_score, avatar_palette_index, banner_palette_index, badge, university_role, university',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    console.error('fetchProfileByUserId', error)
    return null
  }

  return mapProfileRow(data as Parameters<typeof mapProfileRow>[0])
}

export async function fetchRelatedMembers(
  area: MemberArea,
  excludeUserId: string,
  limit = 3,
): Promise<MemberProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, career, cycle, area, status, bio, github_url, linkedin_url, created_at, onboarding_completed, reputation_score, avatar_palette_index, banner_palette_index, badge, university_role, university',
    )
    .eq('status', 'activo')
    .eq('area', area)
    .neq('id', excludeUserId)
    .limit(limit)

  if (error || !data) {
    console.error('fetchRelatedMembers', error)
    return []
  }

  return data.map((row) => mapProfileRow(row as Parameters<typeof mapProfileRow>[0]))
}

export async function fetchPublishedNews(): Promise<NewsPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select('id, slug, title, excerpt, content, category, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(100)

  if (error || !data) {
    console.error('fetchPublishedNews', error)
    return []
  }

  return data
    .map((row) => {
      const catRaw = String(row.category ?? 'update')
      const category: NewsCategory = isNewsCategory(catRaw) ? catRaw : 'update'
      const published = row.published_at as string | null
      const date = published ? published.slice(0, 10) : new Date().toISOString().slice(0, 10)
      return {
        id: String(row.id),
        slug: String(row.slug),
        title: String(row.title),
        excerpt: String(row.excerpt ?? ''),
        content: String(row.content ?? ''),
        category,
        date,
        author: 'Computer Science Hub',
      } satisfies NewsPost
    })
    .filter((p) => p.slug)
}

export async function fetchNewsBySlug(slug: string): Promise<NewsPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('news')
    .select('id, slug, title, excerpt, content, category, published_at')
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('fetchNewsBySlug', error)
    return null
  }

  const catRaw = String(data.category ?? 'update')
  const category: NewsCategory = isNewsCategory(catRaw) ? catRaw : 'update'
  const published = data.published_at as string | null
  const date = published ? published.slice(0, 10) : new Date().toISOString().slice(0, 10)

  return {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title),
    excerpt: String(data.excerpt ?? ''),
    content: String(data.content ?? ''),
    category,
    date,
    author: 'Computer Science Hub',
  }
}

export async function fetchPublishedEvents(): Promise<HubEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(
      'id, title, description, event_date, event_time, speaker, type, location, registration_url, created_by',
    )
    .eq('published', true)
    .order('event_date', { ascending: true })
    .limit(200)

  if (error || !data) {
    console.error('fetchPublishedEvents', error)
    return []
  }

  return data.map((row) => {
    const typeRaw = String(row.type ?? 'otro')
    const type: HubEventType = isHubEventType(typeRaw) ? typeRaw : 'otro'
    const dateStr = row.event_date as string
    return {
      id: String(row.id),
      title: String(row.title),
      description: String(row.description ?? ''),
      date: dateStr,
      time: String(row.event_time ?? '00:00'),
      speaker: row.speaker ? String(row.speaker) : undefined,
      type,
      location: String(row.location ?? ''),
      registrationUrl: row.registration_url ? String(row.registration_url) : undefined,
      createdBy: row.created_by ? String(row.created_by) : null,
    }
  })
}

export type OpportunityRow = {
  id: string
  title: string
  organization: string
  description: string
  url: string
  type: string
}

export async function fetchPublishedOpportunities(): Promise<OpportunityRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, organization, description, url, type')
    .eq('published', true)
    .order('title', { ascending: true })
    .limit(200)

  if (error || !data) {
    console.error('fetchPublishedOpportunities', error)
    return []
  }

  return data.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    organization: String(row.organization),
    description: String(row.description ?? ''),
    url: String(row.url ?? '#'),
    type: String(row.type ?? ''),
  }))
}

export type ResourceRow = {
  id: string
  title: string
  description: string
  url: string
  category: string
  tags: string[]
}

export async function fetchPublishedResources(): Promise<ResourceRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, description, url, category, tags')
    .eq('published', true)
    .order('title', { ascending: true })
    .limit(200)

  if (error || !data) {
    console.error('fetchPublishedResources', error)
    return []
  }

  return data.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ''),
    url: String(row.url ?? '#'),
    category: String(row.category ?? 'computacion'),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  }))
}

export async function fetchUserEventRegistrations(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('user_id', userId)

  if (error || !data) {
    console.error('fetchUserEventRegistrations', error)
    return []
  }

  return data.map((r) => String(r.event_id))
}

export async function fetchActiveSponsors(): Promise<Sponsor[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sponsors')
    .select('id, name, logo_url, website_url, tier')
    .eq('active', true)
    .order('name', { ascending: true })
    .limit(50)

  if (error || !data) {
    console.error('fetchActiveSponsors', error)
    return []
  }

  return data.map((row) => {
    const tierRaw = String(row.tier ?? 'aliado')
    const tier: SponsorTier = isSponsorTier(tierRaw) ? tierRaw : 'aliado'
    return {
      id: String(row.id),
      name: String(row.name),
      logoUrl: row.logo_url ? String(row.logo_url) : '',
      url: String(row.website_url ?? '#'),
      tier,
    }
  })
}

export type UserEventRegistration = {
  id: string
  title: string
  event_date: string
  event_time: string
}

export async function fetchUserRegisteredEvents(
  userId: string,
  limit = 5,
): Promise<UserEventRegistration[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_registrations')
    .select('event_id, events (id, title, event_date, event_time)')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('fetchUserRegisteredEvents', error)
    return []
  }

  return data
    .map((reg) => {
      const event = reg.events as unknown
      if (event && typeof event === 'object' && !Array.isArray(event)) {
        return event as UserEventRegistration
      }
      return null
    })
    .filter((event): event is UserEventRegistration => event !== null)
}

export type UserTutoringRequest = {
  id: string
  topic: string
  status: string
  created_at: string
}

export async function fetchUserTutoringRequests(
  userId: string,
  limit = 3,
): Promise<UserTutoringRequest[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tutoring_requests')
    .select('id, topic, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('fetchUserTutoringRequests', error)
    return []
  }

  return data
}

export type UserMentorProfile = {
  role: string
  active: boolean
}

export async function fetchUserMentorProfile(userId: string): Promise<UserMentorProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mentor_matching_profiles')
    .select('role, active')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('fetchUserMentorProfile', error)
    return null
  }

  return data
}

export type UserIdea = {
  id: string
  title: string
  status: string
  created_at: string
}

/**
 * Correo personal de respaldo. Vive en `profile_contacts`, no en `profiles`,
 * porque esa tabla tiene RLS dueño/admin únicamente (ver migración
 * `20260913120000_profile_contacts.sql`) — a diferencia de `profiles`, cuyo
 * SELECT es público para perfiles activos. No exponer nunca vía mapProfileRow.
 */
export async function fetchPersonalEmail(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profile_contacts')
    .select('personal_email')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error('fetchPersonalEmail', error)
    return null
  }

  return (data.personal_email as string | null) ?? null
}

export async function fetchUserIdeas(userId: string, limit = 3): Promise<UserIdea[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('community_ideas')
    .select('id, title, status, created_at')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('fetchUserIdeas', error)
    return []
  }

  return data
}

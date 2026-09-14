// ─────────────────────────────────────────────────────────────
// Tipos de Área y Estado del Miembro
// ─────────────────────────────────────────────────────────────

export type MemberArea =
  | 'frontend'
  | 'backend'
  | 'diseño'
  | 'devops'
  | 'ia'
  | 'ciberseguridad'
  | 'robótica'
  | 'juegos'
  | 'general'

export type MemberStatus = 'activo' | 'inactivo'

// ─────────────────────────────────────────────────────────────
// CSH-S0-006: Bandas y Roles de Usuario
// ─────────────────────────────────────────────────────────────

/** Badges del núcleo/staff administrativo (CSH-S0-006) */
export type CoreBadge = 
  | 'ceo_founder'    // Creador del Hub
  | 'primary_agent'  // Primera mesa de agents (fundadores)
  | 'primary_fellow' // Primera mesa de fellows (fundadores)
  | 'agent'          // Colaborador del hub

/** Badges de miembros y la comunidad en general */
export type CommunityBadge =
  | 'member'         // Usuario registrado activo
  | 'fellow'         // Sponsor / patrocinador
  | 'catedratico'    // Profesor / maestro de la facultad
  | 'estudiante'     // Alumno de la facultad

/** Badge visual que identifica el rol/categoría del usuario en el hub */
export type UserBadge = CoreBadge | CommunityBadge

/** Rol universitario del usuario */
export type UniversityRole = 'estudiante' | 'catedratico'

/** Configuración de display para cada badge */
export interface BadgeConfig {
  label: string
  /** Clase de Tailwind para color del chip */
  className: string
  /** Emoji o símbolo representativo */
  icon: string
  /** Si solo puede asignarse por admin (no editable por usuario) */
  adminOnly: boolean
}

/** Mapa de configuración de todos los badges disponibles */
export const BADGE_CONFIG: Record<UserBadge, BadgeConfig> = {
  ceo_founder: {
    label: 'CEO Founder',
    className: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    icon: '👑',
    adminOnly: true,
  },
  primary_agent: {
    label: 'Primary Agent',
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
    icon: '🔥',
    adminOnly: true,
  },
  primary_fellow: {
    label: 'Primary Fellow',
    className: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    icon: '💜',
    adminOnly: true,
  },
  agent: {
    label: 'Agent',
    className: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    icon: '⚡',
    adminOnly: false,
  },
  member: {
    label: 'Member',
    className: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    icon: '✦',
    adminOnly: false,
  },
  fellow: {
    label: 'Fellow',
    className: 'border-blue-500/30 bg-blue-500/5 text-blue-300',
    icon: '💎',
    adminOnly: false,
  },
  catedratico: {
    label: 'Catedrático',
    className: 'border-red-500/30 bg-red-500/5 text-red-400',
    icon: '🎓',
    adminOnly: false,
  },
  estudiante: {
    label: 'Estudiante',
    className: 'border-white/15 bg-white/5 text-white/60',
    icon: '📚',
    adminOnly: false,
  },
}

// ─────────────────────────────────────────────────────────────
// CSH-S0-007: Multi-Universidad
// ─────────────────────────────────────────────────────────────

/** Universidades disponibles en el hub */
export type UniversityCode = 'UDB' | 'UCA' | 'UES' | 'UFG' | 'UEES' | 'ESEN'

export interface University {
  code: UniversityCode
  name: string
  shortName?: string
  country: string
  active: boolean
  sortOrder: number
}

// ─────────────────────────────────────────────────────────────
// Perfil del Miembro (actualizado con badge, universityRole, university)
// ─────────────────────────────────────────────────────────────

export interface MemberProfile {
  id: string
  name: string
  career: string
  cycle: number
  area: MemberArea
  bio?: string
  github?: string
  linkedin?: string
  status: MemberStatus
  joinedAt: string
  onboardingCompleted: boolean
  reputationScore: number
  avatarPaletteIndex?: number | null
  bannerPaletteIndex?: number | null
  /** CSH-S0-006: Badge visual del usuario */
  badge: UserBadge
  /** CSH-S0-006: Rol universitario */
  universityRole: UniversityRole
  /** CSH-S0-007: Universidad a la que pertenece */
  university: UniversityCode
}

// ─────────────────────────────────────────────────────────────
// Otros tipos existentes
// ─────────────────────────────────────────────────────────────

export type NewsCategory = 'anuncio' | 'logro' | 'evento' | 'update'

export interface NewsPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: NewsCategory
  date: string
  author: string
}

export type HubEventType = 'workshop' | 'charla' | 'hackathon' | 'copa' | 'networking' | 'otro'

export interface HubEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  speaker?: string
  type: HubEventType
  location: string
  registrationUrl?: string
  createdBy?: string | null
}

// ─────────────────────────────────────────────────────────────
// CSH-28: Clasificación de ideas de la comunidad
// ─────────────────────────────────────────────────────────────

export const IDEA_CATEGORIES = ['feature', 'improvement', 'bug', 'other'] as const
export const IDEA_IMPACTS = ['high', 'medium', 'low'] as const

export type IdeaCategory = (typeof IDEA_CATEGORIES)[number]
export type IdeaImpact = (typeof IDEA_IMPACTS)[number]

export type SponsorTier = 'principal' | 'colaborador' | 'aliado'

export interface Sponsor {
  id: string
  name: string
  logoUrl: string
  url: string
  tier: SponsorTier
}

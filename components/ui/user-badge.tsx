'use client'

import { cva, type VariantProps } from 'class-variance-authority'

import { BADGE_CONFIG, type UserBadge } from '@/src/types'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Variantes de tamaño del chip
// ─────────────────────────────────────────────────────────────

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-widest transition-all duration-200',
  {
    variants: {
      size: {
        xs: 'px-1.5 py-0.5 text-[8px]',
        sm: 'px-2 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
        lg: 'px-3 py-1.5 text-xs',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

// ─────────────────────────────────────────────────────────────
// Props del componente
// ─────────────────────────────────────────────────────────────

interface UserBadgeProps extends VariantProps<typeof badgeVariants> {
  badge: UserBadge
  /** Mostrar el ícono emoji junto al label */
  showIcon?: boolean
  /** Solo mostrar el ícono sin el label (útil en espacios muy reducidos) */
  iconOnly?: boolean
  className?: string
  /** Tooltip personalizado. Por defecto usa el label del badge. */
  title?: string
}

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

/**
 * UserBadge — Chip visual para mostrar el rol/banda de un usuario en el hub.
 *
 * @example
 * // En tarjeta de miembro
 * <UserBadge badge="agent" size="sm" />
 *
 * // En perfil con ícono
 * <UserBadge badge="ceo_founder" size="md" showIcon />
 *
 * // Solo ícono, tamaño mínimo
 * <UserBadge badge="fellow" size="xs" iconOnly />
 */
export function UserBadge({
  badge,
  size,
  showIcon = false,
  iconOnly = false,
  className,
  title,
}: UserBadgeProps) {
  const config = BADGE_CONFIG[badge]
  if (!config) return null

  const tooltipTitle = title ?? config.label

  return (
    <span
      className={cn(badgeVariants({ size }), config.className, className)}
      title={tooltipTitle}
      aria-label={`Rol: ${tooltipTitle}`}
    >
      {(showIcon || iconOnly) && (
        <span
          className="text-[0.85em] leading-none"
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}
      {!iconOnly && <span>{config.label}</span>}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// Grupo de badges (ej: badge de rol + área técnica juntos)
// ─────────────────────────────────────────────────────────────

interface BadgeGroupProps {
  badge: UserBadge
  /** Label adicional (ej: área técnica) */
  extra?: string
  size?: VariantProps<typeof badgeVariants>['size']
}

/**
 * BadgeGroup — Muestra el badge de rol + un label extra (como el área técnica).
 * Útil en las tarjetas del directorio de miembros.
 */
export function BadgeGroup({ badge, extra, size = 'sm' }: BadgeGroupProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <UserBadge badge={badge} size={size} showIcon />
      {extra && (
        <span
          className={cn(
            badgeVariants({ size }),
            'border-white/[0.08] bg-white/[0.02] text-white/50',
          )}
        >
          {extra}
        </span>
      )}
    </div>
  )
}

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type ContextualSuggestionItem = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  /** Solo informativo: muestra badge “Cuenta” */
  requiresAuth?: boolean
}

type ContextualSuggestionProps = {
  suggestions: ContextualSuggestionItem[]
  title?: string
  /** `dark` para fondos #0D0D0D; `light` para páginas con tema claro */
  theme?: 'dark' | 'light'
  className?: string
}

export function ContextualSuggestion({
  suggestions,
  title = 'También podés…',
  theme = 'light',
  className,
}: ContextualSuggestionProps) {
  if (suggestions.length === 0) return null

  const isDark = theme === 'dark'

  return (
    <section
      aria-label={title}
      className={cn(
        'border-t py-12 sm:py-14',
        isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-border bg-muted/30',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.2em]',
            isDark ? 'text-white/40' : 'text-muted-foreground',
          )}
        >
          {title}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {suggestions.map(({ title: cardTitle, description, href, icon: Icon, requiresAuth }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex gap-4 rounded-xl border p-5 transition-colors',
                isDark
                  ? 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]'
                  : 'border-border bg-card hover:bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border',
                  isDark ? 'border-white/[0.08] bg-white/[0.04]' : 'border-border bg-muted/40',
                )}
              >
                <Icon className={cn('h-5 w-5', isDark ? 'text-white/45' : 'text-muted-foreground')} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'font-semibold',
                      isDark ? 'text-white' : 'text-foreground',
                    )}
                  >
                    {cardTitle}
                  </span>
                  {requiresAuth ? (
                    <Badge variant="account" className="text-[10px] uppercase tracking-wider">
                      Cuenta
                    </Badge>
                  ) : null}
                </div>
                <p
                  className={cn(
                    'mt-1 text-sm leading-relaxed',
                    isDark ? 'text-white/45' : 'text-muted-foreground',
                  )}
                >
                  {description}
                </p>
                <span
                  className={cn(
                    'mt-3 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider',
                    isDark ? 'text-white/50 group-hover:text-white/80' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  Explorar
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

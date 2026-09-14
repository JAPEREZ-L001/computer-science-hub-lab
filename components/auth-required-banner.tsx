import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AuthRequiredBannerProps = {
  variant: 'inline' | 'empty-state'
  title: string
  description: string
  loginHref: string
  registerHref?: string
  loginLabel?: string
  registerLabel?: string
  theme?: 'dark' | 'light'
  className?: string
}

export function AuthRequiredBanner({
  variant,
  title,
  description,
  loginHref,
  registerHref,
  loginLabel = 'Iniciar sesión',
  registerLabel = 'Registrarme',
  theme = 'dark',
  className,
}: AuthRequiredBannerProps) {
  const isDark = theme === 'dark'
  const btnSize = variant === 'empty-state' ? 'default' : 'sm'

  const shell = cn(
    'rounded-lg border p-5 sm:p-6 text-center',
    variant === 'empty-state' && 'p-8',
    isDark
      ? 'border-white/[0.08] bg-white/[0.02]'
      : 'border-border bg-muted/40',
    className,
  )

  const titleCls = cn('font-semibold', isDark ? 'text-white' : 'text-foreground')
  const descCls = cn('text-sm', isDark ? 'text-white/50' : 'text-muted-foreground')

  return (
    <div className={shell}>
      <p className={titleCls}>{title}</p>
      <p className={cn(descCls, 'mt-2')}>{description}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button asChild size={btnSize}>
          <Link href={loginHref}>{loginLabel}</Link>
        </Button>
        {registerHref ? (
          <Button
            asChild
            size={btnSize}
            variant="outline"
            className={
              isDark ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : undefined
            }
          >
            <Link href={registerHref}>{registerLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

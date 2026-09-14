import * as React from 'react'

import { cn } from '@/lib/utils'

export function AuthCard({
  title,
  description,
  children,
  innerMaxWidthClassName = 'max-w-sm',
}: {
  title: string
  description?: string
  children: React.ReactNode
  /** Ancho máximo del bloque del formulario (p. ej. registro usa `max-w-lg`). */
  innerMaxWidthClassName?: string
}) {
  return (
    <div className="relative min-w-0 w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/80 px-4 py-8 shadow-xl backdrop-blur-2xl sm:rounded-3xl sm:px-6 sm:py-10 sm:shadow-2xl md:px-12 md:py-14">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

      <div className={cn('relative z-10 mx-auto w-full', innerMaxWidthClassName)}>
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm font-medium leading-relaxed text-white/50 sm:mt-3">
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-4 min-w-0">{children}</div>
      </div>
    </div>
  )
}

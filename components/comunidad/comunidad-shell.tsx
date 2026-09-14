import type { ReactNode } from 'react'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PageBreadcrumb } from '@/components/page-breadcrumb'

export function ComunidadShell({
  eyebrow,
  title,
  titleAccent,
  description,
  children,
  beforeFooter,
  pathname,
}: {
  eyebrow: string
  title: string
  titleAccent: string
  description: string
  children: ReactNode
  /** Contenido entre la sección principal y el footer (p. ej. sugerencias contextuales) */
  beforeFooter?: ReactNode
  /** El pathname de la ruta actual para generar el breadcrumb automáticamente */
  pathname?: string
}) {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <Header />
      <div className="overflow-x-hidden">
        <section className="relative pt-36 pb-16 sm:pt-40">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
            {pathname && (
              <PageBreadcrumb pathname={pathname} className="mb-6" />
            )}
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              {eyebrow}
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-white">{title}</span>
              <br />
              <span className="text-white/40">{titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/50">{description}</p>
          </div>
        </section>
        <section className="border-t border-white/[0.06] pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
        </section>
        {beforeFooter}
        <Footer />
      </div>
    </main>
  )
}


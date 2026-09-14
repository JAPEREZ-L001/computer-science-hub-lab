import Link from 'next/link'

import { CshDeltaMark } from '@/components/csh-delta-mark'

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-[#050505] text-white overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.015] blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg gap-8">
        <CshDeltaMark
          aria-label="CSH"
          className="h-10 w-10 shrink-0 object-contain text-white opacity-30"
        />

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">
            Error 404
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Página no encontrada
          </h1>
          <p className="text-sm leading-relaxed text-white/40 max-w-md mx-auto">
            La ruta que buscas no existe o fue movida. Puede que el enlace esté
            desactualizado o que hayas escrito la dirección incorrectamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link
            href="/"
            className="btn-press rounded-full bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            Volver al inicio
          </Link>
          <Link
            href="/comunidad"
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 transition-all hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
          >
            Explorar comunidad
          </Link>
        </div>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { href: '/eventos', label: 'Eventos' },
            { href: '/noticias', label: 'Noticias' },
            { href: '/oportunidades', label: 'Oportunidades' },
            { href: '/recursos', label: 'Recursos' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 transition-colors hover:text-white/70"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}

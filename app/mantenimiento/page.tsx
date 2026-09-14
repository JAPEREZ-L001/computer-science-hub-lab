import type { Metadata } from 'next'

import { CshDeltaMark } from '@/components/csh-delta-mark'

export const metadata: Metadata = {
  title: 'Volvemos pronto | Computer Science Hub',
  description: 'El sitio de Computer Science Hub está temporalmente fuera de línea.',
  // El apagón es temporal: pedimos a los buscadores que no archiven esta
  // pantalla ni la dejen como resultado del sitio.
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function MantenimientoPage() {
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
            Fuera de línea
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Volvemos pronto
          </h1>
          <p className="text-sm leading-relaxed text-white/40 max-w-md mx-auto">
            Computer Science Hub está temporalmente cerrado al público mientras
            preparamos la siguiente etapa del proyecto. No hace falta que hagas
            nada: cuando reabramos, esta misma dirección volverá a funcionar.
          </p>
        </div>
      </div>
    </main>
  )
}

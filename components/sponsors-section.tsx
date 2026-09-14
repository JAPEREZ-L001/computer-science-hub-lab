import Link from 'next/link'

import { fetchActiveSponsors } from '@/src/lib/supabase/queries'
import type { Sponsor } from '@/src/types'

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  if (sponsor.logoUrl) {
    return (
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-white/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 rounded-full" />
        <img
          src={sponsor.logoUrl}
          alt={sponsor.name}
          className="relative h-8 sm:h-10 md:h-12 w-auto max-w-[140px] sm:max-w-[180px] object-contain opacity-40 grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
        />
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-white/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 rounded-full" />
      <span className="relative text-lg sm:text-xl md:text-2xl font-black tracking-tighter text-white/30 transition-all duration-500 group-hover:scale-105 group-hover:text-white group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        {sponsor.name}
      </span>
    </div>
  )
}

export async function SponsorsSection() {
  const sponsors = await fetchActiveSponsors()

  if (sponsors.length === 0) {
    return null
  }

  return (
    <section className="relative border-t border-white/[0.06] py-24 sm:py-32 overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-white/[0.015] blur-[100px]" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-center justify-center text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
            Partners Oficiales
          </h2>
          <p className="mt-4 text-sm font-medium text-white/50 max-w-2xl">
            Impulsando el ecosistema tecnológico con el apoyo de las mejores organizaciones.
          </p>
        </div>

        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-12 sm:gap-x-20 sm:gap-y-16">
          {sponsors.map((sponsor) => (
            <Link
              key={sponsor.id}
              href={sponsor.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-center transition-all duration-500 focus:outline-none"
              aria-label={`Visitar sitio de ${sponsor.name}`}
            >
              <SponsorLogo sponsor={sponsor} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/comunidad/tutorias', label: 'Tutorías' },
  { href: '/comunidad/mentores', label: 'Mentores' },
] as const

export function ComunidadTabsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div className="mb-10 flex gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1.5 w-fit">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-xl px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                isActive
                  ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}

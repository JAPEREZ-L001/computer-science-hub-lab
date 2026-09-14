'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Briefcase,
  BookOpen,
  HeartHandshake,
  Users,
  ExternalLink,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { href: '/admin/oportunidades', label: 'Oportunidades', icon: Briefcase },
  { href: '/admin/recursos', label: 'Recursos', icon: BookOpen },
  { href: '/admin/sponsors', label: 'Sponsors', icon: HeartHandshake },
  { href: '/admin/miembros', label: 'Miembros', icon: Users },
] as const

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Panel
        </p>
        <p className="mt-1 text-sm font-semibold text-white">Computer Science Hub</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const navActive =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                navActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" />
              {label}
            </Link>
          )
        })}
      </nav>

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Volver al sitio público
      </Link>
    </div>
  )
}

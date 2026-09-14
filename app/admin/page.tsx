import Link from 'next/link'
import {
  Newspaper,
  Calendar,
  Briefcase,
  BookOpen,
  HeartHandshake,
  Users,
  ClipboardList,
} from 'lucide-react'

import { adminCounts } from '@/src/lib/supabase/admin-queries'

import { Card } from '@/components/ui/card'

const cards = [
  { key: 'news' as const, label: 'Noticias', href: '/admin/noticias', icon: Newspaper },
  { key: 'events' as const, label: 'Eventos', href: '/admin/eventos', icon: Calendar },
  { key: 'opportunities' as const, label: 'Oportunidades', href: '/admin/oportunidades', icon: Briefcase },
  { key: 'resources' as const, label: 'Recursos', href: '/admin/recursos', icon: BookOpen },
  { key: 'sponsors' as const, label: 'Sponsors', href: '/admin/sponsors', icon: HeartHandshake },
  { key: 'profiles' as const, label: 'Miembros', href: '/admin/miembros', icon: Users },
  {
    key: 'registrations' as const,
    label: 'Inscripciones',
    href: '/admin/eventos',
    icon: ClipboardList,
  },
]

export default async function AdminDashboardPage() {
  const counts = await adminCounts()

  const countMap = {
    news: counts.news,
    events: counts.events,
    opportunities: counts.opportunities,
    resources: counts.resources,
    sponsors: counts.sponsors,
    profiles: counts.profiles,
    registrations: counts.registrations,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Resumen</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gestioná contenido público, sponsors y perfiles desde un solo lugar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, label, href, icon: Icon }) => (
          <Link key={key} href={href}>
            <Card className="h-full border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-300">{label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
                    {countMap[key]}
                  </p>
                </div>
                <Icon className="h-5 w-5 text-zinc-500" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

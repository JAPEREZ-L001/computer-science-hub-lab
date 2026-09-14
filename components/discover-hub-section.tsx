'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, GraduationCap, Lightbulb, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const STORAGE_KEY = 'csh_hub_discover_dismissed'

const links = [
  {
    href: '/eventos',
    title: 'Eventos',
    description: 'Inscribite a workshops y charlas.',
    icon: Calendar,
  },
  {
    href: '/comunidad/ideas',
    title: 'Ideas',
    description: 'Votá lo que la comunidad prioriza.',
    icon: Lightbulb,
  },
  {
    href: '/comunidad/mentores',
    title: 'Mentores',
    description: 'Directorio y matching.',
    icon: Users,
  },
  {
    href: '/comunidad/tutorias',
    title: 'Tutorías',
    description: 'Pedí acompañamiento entre pares.',
    icon: GraduationCap,
  },
] as const

export function DiscoverHubSection() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const dismissed = window.localStorage.getItem(STORAGE_KEY)
      setVisible(dismissed !== '1')
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Descubrí el Hub</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Atajos a lo que podés hacer hoy con tu cuenta: eventos, ideas, mentores y tutorías.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 self-end sm:self-start"
          onClick={dismiss}
          aria-label="Cerrar sugerencias"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex gap-3 rounded-lg border border-border bg-background/80 p-3 transition-colors hover:bg-muted/60"
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}

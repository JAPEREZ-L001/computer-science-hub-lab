'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ComunidadModuleCardProps = {
  href: string
  title: string
  description: string
  icon: ReactNode
  preview: string
  requiresAuth: boolean
  isRealUser: boolean
}

export function ComunidadModuleCard({
  href,
  title,
  description,
  icon,
  preview,
  requiresAuth,
  isRealUser,
}: ComunidadModuleCardProps) {
  const card = (
    <Card
      className={cn(
        'h-full border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]',
        'focus-within:ring-2 focus-within:ring-white/20',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        {icon}
        <div className="flex flex-wrap justify-end gap-1.5">
          {requiresAuth ? (
            isRealUser ? (
              <Badge variant="unlocked" className="text-[10px] uppercase tracking-wider">
                <CheckCircle2 className="size-3" aria-hidden />
                Disponible
              </Badge>
            ) : (
              <Badge variant="account" className="text-[10px] uppercase tracking-wider">
                Participá
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="border-white/15 text-[10px] uppercase tracking-wider text-white/50">
              Abierto
            </Badge>
          )}
        </div>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/45">{description}</p>
      <p className="sr-only">{preview}</p>
    </Card>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} className="block h-full outline-none">
          {card}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs border border-white/10 bg-[#1a1a1a] text-white">
        {preview}
      </TooltipContent>
    </Tooltip>
  )
}

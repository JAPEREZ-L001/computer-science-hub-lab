'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tag, X } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IDEA_CATEGORIES, type IdeaCategory } from '@/src/types'

const CATEGORY_LABELS: Record<IdeaCategory, string> = {
  feature: 'Nueva función',
  improvement: 'Mejora',
  bug: 'Problema',
  other: 'Otro',
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Abiertas' },
  { value: 'closed', label: 'Cerradas' },
  { value: 'all', label: 'Todas' },
] as const

type IdeaFiltersProps = {
  /** Tags presentes en las ideas cargadas (antes de aplicar el filtro de tags), para armar las opciones. */
  availableTags: string[]
}

export function IdeaFilters({ availableTags }: IdeaFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') || 'open'
  const currentCategory = searchParams.get('category') || 'all'
  const currentTags = (searchParams.get('tags') || '').split(',').filter(Boolean)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  // Si el usuario navega (atrás/adelante) o comparte otra URL, el input debe reflejarlo.
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '')
  }, [searchParams])

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // Debounce: evita un push por cada tecla mientras se escribe la búsqueda.
  useEffect(() => {
    const current = searchParams.get('q') || ''
    if (searchInput === current) return
    const timeout = setTimeout(() => {
      updateParams({ q: searchInput.trim() || null })
    }, 350)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const toggleTag = (tag: string) => {
    const next = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    updateParams({ tags: next.length > 0 ? next.join(',') : null })
  }

  const selectClasses =
    'h-10 rounded-xl border border-white/10 bg-black/40 text-white focus:border-white/30 focus:bg-white/5 focus:ring-2 focus:ring-white/5 min-w-[160px]'

  return (
    <div className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar ideas..."
          aria-label="Buscar ideas por título o descripción"
          className="h-10 min-w-[200px] flex-1 rounded-xl border border-white/[0.08] bg-black/40 px-4 text-sm font-medium text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/[0.05]"
        />

        <Select value={currentStatus} onValueChange={(v) => updateParams({ status: v === 'open' ? null : v })}>
          <SelectTrigger className={selectClasses} aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0D0D0D] text-white">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentCategory} onValueChange={(v) => updateParams({ category: v })}>
          <SelectTrigger className={selectClasses} aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0D0D0D] text-white">
            <SelectItem value="all" className="focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer">
              Todas las categorías
            </SelectItem>
            {IDEA_CATEGORIES.map((c) => (
              <SelectItem
                key={c}
                value={c}
                className="focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer"
              >
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableTags.length > 0 && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              <Tag className="h-3 w-3" />
              Tags
            </p>
            {currentTags.length > 0 && (
              <button
                type="button"
                onClick={() => updateParams({ tags: null })}
                className="flex items-center gap-1 text-[10px] font-semibold text-white/35 transition-colors hover:text-white/70"
              >
                <X className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tags">
            {availableTags.map((tag) => {
              const active = currentTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                    active
                      ? 'border-white/20 bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span className={active ? 'text-black/40' : 'text-white/30'}>#</span>
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

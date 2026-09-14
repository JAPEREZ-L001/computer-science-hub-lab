'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Trash2, ArrowUpDown, Clock, Flame } from 'lucide-react'

import type { CommunityIdeaRow } from '@/src/lib/supabase/community-queries'
import {
  IDEA_CATEGORIES,
  IDEA_IMPACTS,
  type IdeaCategory,
  type IdeaImpact,
} from '@/src/types'
import { getAvatarDataUri } from '@/src/lib/avatar-generator'
import { proposeCommunityIdea, voteCommunityIdea, deleteOwnIdea } from '@/app/comunidad/actions'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const CATEGORY_LABELS: Record<IdeaCategory, string> = {
  feature: 'Nueva función',
  improvement: 'Mejora',
  bug: 'Problema',
  other: 'Otro',
}

const IMPACT_LABELS: Record<IdeaImpact, string> = {
  high: 'Impacto alto',
  medium: 'Impacto medio',
  low: 'Impacto bajo',
}

const IMPACT_STYLES: Record<IdeaImpact, string> = {
  high: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  low: 'border-white/10 bg-white/[0.04] text-white/45',
}

export function IdeasBoard({
  ideas,
  votedIds,
  isAuthenticated,
  currentUserId,
}: {
  ideas: CommunityIdeaRow[]
  votedIds: string[]
  isAuthenticated: boolean
  currentUserId?: string | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const voted = new Set(votedIds)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [propPending, setPropPending] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [impact, setImpact] = useState('')
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'oldest'>('votes')

  const sortedIdeas = useMemo(() => {
    const sorted = [...ideas]
    switch (sortBy) {
      case 'votes':
        return sorted.sort((a, b) => b.vote_count - a.vote_count)
      case 'recent':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      default:
        return sorted
    }
  }, [ideas, sortBy])

  const onVote = async (id: string) => {
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: 'Iniciá sesión para que tu voto cuente',
        description: 'Necesitás una cuenta real para votar en la licitación de ideas.',
      })
      return
    }
    setPendingId(id)
    const res = await voteCommunityIdea(id)
    setPendingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Voto', description: res.message })
      return
    }
    toast({ title: '¡Gracias! Tu voto suma.' })
    router.refresh()
  }

  const onDelete = async (id: string) => {
    setDeletingId(id)
    const res = await deleteOwnIdea(id)
    setDeletingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo eliminar', description: res.message })
      return
    }
    toast({ title: 'Idea eliminada' })
    router.refresh()
  }

  const onPropose = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: 'Iniciá sesión para publicar una idea',
        description: 'Necesitás una cuenta real para sumar propuestas a la licitación.',
      })
      return
    }
    setPropPending(true)
    const res = await proposeCommunityIdea({ title, description, tags, category, impact })
    setPropPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo publicar', description: res.message })
      return
    }
    toast({ title: 'Idea publicada' })
    setTitle('')
    setDescription('')
    setTags('')
    setCategory('')
    setImpact('')
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/45">
          Las ideas con más votos orientan prioridades del Hub (espacios, equipamiento, formatos).
        </p>
        {isAuthenticated ? (
          <Button type="button" variant="outline" className="border-white/20 bg-transparent" onClick={() => setOpen(true)}>
            Proponer idea
          </Button>
        ) : null}
      </div>

      {/* Orden */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex gap-2 shrink-0">
          {([
            { value: 'votes', label: 'Más votadas', icon: Flame },
            { value: 'recent', label: 'Recientes', icon: Clock },
            { value: 'oldest', label: 'Antiguas', icon: ArrowUpDown },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortBy(value)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                sortBy === value
                  ? 'border-white/20 bg-white text-black'
                  : 'border-white/[0.08] bg-white/[0.02] text-white/40 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {sortedIdeas.length === 0 ? (
          <p className="text-sm text-white/40">No se encontraron ideas. Ajustá los filtros o sé el primero en proponer una.</p>
        ) : (
          sortedIdeas.map((idea) => {
            const isOwn = currentUserId != null && idea.author_id === currentUserId
            return (
              <div
                key={idea.id}
                className="flex flex-col gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">{idea.title}</h3>
                  {idea.author_name ? (
                    <p className="mt-1 text-xs text-white/35">
                      Propuesta por{' '}
                      <span className="font-medium text-white/55">{idea.author_name}</span>
                    </p>
                  ) : null}
                  {idea.description ? (
                    <p className="mt-2 text-sm text-white/50">{idea.description}</p>
                  ) : null}
                  {(idea.category || idea.impact || idea.tags.length > 0) && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {idea.category && (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/55">
                          {CATEGORY_LABELS[idea.category]}
                        </span>
                      )}
                      {idea.impact && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${IMPACT_STYLES[idea.impact]}`}
                        >
                          {IMPACT_LABELS[idea.impact]}
                        </span>
                      )}
                      {idea.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-white/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-white/40"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {isOwn && (
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                      Tu idea
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  {idea.voters && idea.voters.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-2">
                        {idea.voters.slice(0, 4).map((voter) => (
                          <img
                            key={voter.user_id}
                            src={getAvatarDataUri(voter.user_id, 28)}
                            alt={voter.display_name}
                            title={voter.display_name}
                            className="h-7 w-7 rounded-full border-2 border-[#0D0D0D]"
                          />
                        ))}
                      </div>
                      {idea.vote_count > 4 && (
                        <span className="text-[10px] font-bold text-white/30">+{idea.vote_count - 4}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-white/40">{idea.vote_count} votos</span>
                  <Button
                    type="button"
                    size="sm"
                    variant={voted.has(idea.id) ? 'secondary' : 'default'}
                    disabled={!isAuthenticated || voted.has(idea.id) || pendingId === idea.id}
                    onClick={() => onVote(idea.id)}
                    className={voted.has(idea.id) ? 'opacity-60' : ''}
                  >
                    {voted.has(idea.id) ? 'Ya votaste' : 'Votar'}
                  </Button>
                  {isOwn && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={deletingId === idea.id}
                      onClick={() => onDelete(idea.id)}
                      className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                      title="Eliminar tu idea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-[#111] text-white sm:max-w-md">
          <form onSubmit={onPropose}>
            <DialogHeader>
              <DialogTitle>Nueva idea</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idea-t">Título</Label>
                <Input
                  id="idea-t"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="idea-d">Descripción</Label>
                <Textarea
                  id="idea-d"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-white/10 bg-white/5"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="idea-cat">Categoría</Label>
                  <select
                    id="idea-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-white/30 focus:outline-none"
                  >
                    <option value="" className="bg-[#111]">Sin especificar</option>
                    {IDEA_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#111]">
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="idea-impact">Impacto</Label>
                  <select
                    id="idea-impact"
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-white/30 focus:outline-none"
                  >
                    <option value="" className="bg-[#111]">Sin especificar</option>
                    {IDEA_IMPACTS.map((i) => (
                      <option key={i} value={i} className="bg-[#111]">
                        {IMPACT_LABELS[i]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="idea-tags">Tags</Label>
                <Input
                  id="idea-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="espacios, equipamiento, talleres"
                  className="border-white/10 bg-white/5"
                />
                <p className="text-xs text-white/35">Separados por coma, hasta 5.</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={propPending}>
                Publicar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Eye, EyeOff, Pencil, Star, Trash2 } from 'lucide-react'

import type { CommunityIdeaAdminRow, MentorCandidateRow } from '@/src/lib/supabase/admin-queries'
import {
  deleteIdeaAdmin,
  saveIdea,
  toggleIdeaPinned,
  updateIdeaStatus,
} from '@/app/admin/actions/community-ideas'
import { useToast } from '@/components/ui/use-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Radix Select reserva value="" para "sin selección", así que los campos
// opcionales usan este sentinel y se traducen a '' recién al enviar.
const NONE = 'none'

const EXECUTION_LABELS: Record<string, string> = {
  proposed: 'Propuesta',
  planned: 'Planificada',
  in_progress: 'En progreso',
  done: 'Implementada',
  discarded: 'Descartada',
}

const EXECUTION_VARIANTS: Record<string, 'outline' | 'interactive' | 'unlocked' | 'account'> = {
  proposed: 'outline',
  planned: 'account',
  in_progress: 'interactive',
  done: 'unlocked',
  discarded: 'outline',
}

const CATEGORY_LABELS: Record<string, string> = {
  feature: 'Funcionalidad',
  improvement: 'Mejora',
  bug: 'Error',
  other: 'Otro',
}

const IMPACT_LABELS: Record<string, string> = {
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
}

type FormState = {
  id: string
  title: string
  description: string
  category: string
  impact: string
  tags: string
  status: string
  execution_status: string
  execution_notes: string
  owner_id: string
  location: string
  scheduled_at: string
}

export function IdeasAdminPanel({
  initialRows,
  members,
}: {
  initialRows: CommunityIdeaAdminRow[]
  members: MentorCandidateRow[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState | null>(null)
  const [executionFilter, setExecutionFilter] = useState('all')

  const rows = useMemo(
    () =>
      executionFilter === 'all'
        ? initialRows
        : initialRows.filter((r) => r.execution_status === executionFilter),
    [initialRows, executionFilter],
  )

  const openEdit = (row: CommunityIdeaAdminRow) => {
    setForm({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      category: row.category ?? NONE,
      impact: row.impact ?? NONE,
      tags: row.tags.join(', '),
      status: row.status === 'open' ? 'open' : 'closed',
      execution_status: row.execution_status,
      execution_notes: row.execution_notes ?? '',
      owner_id: row.owner_id ?? NONE,
      location: row.location ?? '',
      scheduled_at: row.scheduled_at ?? '',
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setPendingId(form.id)
    const res = await saveIdea({
      ...form,
      category: form.category === NONE ? '' : form.category,
      impact: form.impact === NONE ? '' : form.impact,
      owner_id: form.owner_id === NONE ? '' : form.owner_id,
    })
    setPendingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Idea actualizada' })
    setOpen(false)
    router.refresh()
  }

  const handleTogglePinned = async (row: CommunityIdeaAdminRow) => {
    setPendingId(row.id)
    const res = await toggleIdeaPinned({ id: row.id, pinned: !row.pinned })
    setPendingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: row.pinned ? 'Ya no está destacada' : 'Idea destacada' })
    router.refresh()
  }

  const handleToggleStatus = async (row: CommunityIdeaAdminRow) => {
    setPendingId(row.id)
    const nextStatus = row.status === 'open' ? 'closed' : 'open'
    const res = await updateIdeaStatus({ id: row.id, status: nextStatus })
    setPendingId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: nextStatus === 'open' ? 'Idea visible' : 'Idea oculta' })
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setPendingId(deleteId)
    const res = await deleteIdeaAdmin(deleteId)
    setPendingId(null)
    setDeleteId(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Eliminada' })
    router.refresh()
  }

  const setField = (key: keyof FormState, value: string) =>
    setForm((f) => (f ? { ...f, [key]: value } : f))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ideas de la comunidad</h1>
          <p className="text-sm text-zinc-400">
            Moderá la visibilidad y hacé seguimiento de las ideas que se están llevando a cabo.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="idea-filter" className="text-xs text-zinc-500">
            Filtrar por ejecución
          </Label>
          <Select value={executionFilter} onValueChange={setExecutionFilter}>
            <SelectTrigger id="idea-filter" className="w-[180px] border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(EXECUTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Título</TableHead>
              <TableHead className="text-zinc-300">Autor</TableHead>
              <TableHead className="text-zinc-300">Votos</TableHead>
              <TableHead className="text-zinc-300">Visibilidad</TableHead>
              <TableHead className="text-zinc-300">Ejecución</TableHead>
              <TableHead className="text-zinc-300">Responsable</TableHead>
              <TableHead className="w-[160px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={7} className="text-center text-zinc-500">
                  {initialRows.length === 0
                    ? 'No hay ideas.'
                    : 'Ninguna idea coincide con el filtro.'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const busy = pendingId === row.id
                const isOpen = row.status === 'open'
                return (
                  <TableRow key={row.id} className="border-white/10">
                    <TableCell className="max-w-[220px] font-medium text-zinc-200">
                      <span className="flex items-center gap-1.5">
                        {row.pinned ? (
                          <Star
                            className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                            aria-label="Destacada"
                          />
                        ) : null}
                        <span className="truncate">{row.title}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400">{row.author_name}</TableCell>
                    <TableCell className="text-zinc-400">{row.vote_count}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || row.status === 'archived'}
                        className="h-7 gap-1.5 border-white/10 bg-white/5 px-2 text-xs font-normal"
                        onClick={() => handleToggleStatus(row)}
                      >
                        {isOpen ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
                        )}
                        {row.status === 'archived'
                          ? 'Archivada'
                          : isOpen
                            ? 'Visible'
                            : 'Oculta'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={EXECUTION_VARIANTS[row.execution_status] ?? 'outline'}>
                        {EXECUTION_LABELS[row.execution_status] ?? row.execution_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-zinc-400">
                      {row.owner_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={busy}
                        className={
                          row.pinned
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-zinc-400 hover:text-white'
                        }
                        title={row.pinned ? 'Quitar de destacadas' : 'Destacar idea'}
                        onClick={() => handleTogglePinned(row)}
                      >
                        <Star className={row.pinned ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white"
                        title="Editar idea"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-red-400"
                        title="Eliminar idea"
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg">
          {form ? (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Editar idea</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="idea-title">Título</Label>
                  <Input
                    id="idea-title"
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    required
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idea-desc">Descripción</Label>
                  <Textarea
                    id="idea-desc"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    rows={3}
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Categoría</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setField('category', v)}
                    >
                      <SelectTrigger className="border-white/10 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Sin categoría</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Impacto</Label>
                    <Select value={form.impact} onValueChange={(v) => setField('impact', v)}>
                      <SelectTrigger className="border-white/10 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Sin definir</SelectItem>
                        {Object.entries(IMPACT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idea-tags">Tags</Label>
                  <Input
                    id="idea-tags"
                    value={form.tags}
                    onChange={(e) => setField('tags', e.target.value)}
                    placeholder="hardware, laboratorio"
                    className="border-white/10 bg-white/5"
                  />
                  <p className="text-xs text-zinc-500">Separados por coma. Máximo 5.</p>
                </div>
                <div className="grid gap-2">
                  <Label>Visibilidad</Label>
                  <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Visible para la comunidad</SelectItem>
                      <SelectItem value="closed">Oculta (solo admins)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-2 border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Ejecución
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Cómo, quién y dónde se lleva a cabo. Independiente de la visibilidad.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Estado</Label>
                    <Select
                      value={form.execution_status}
                      onValueChange={(v) => setField('execution_status', v)}
                    >
                      <SelectTrigger className="border-white/10 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EXECUTION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Responsable</Label>
                    <Select value={form.owner_id} onValueChange={(v) => setField('owner_id', v)}>
                      <SelectTrigger className="border-white/10 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Sin asignar</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="idea-loc">Lugar</Label>
                    <Input
                      id="idea-loc"
                      value={form.location}
                      onChange={(e) => setField('location', e.target.value)}
                      placeholder="Laboratorio B, online…"
                      className="border-white/10 bg-white/5"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="idea-date">Fecha prevista</Label>
                    <Input
                      id="idea-date"
                      type="date"
                      value={form.scheduled_at}
                      onChange={(e) => setField('scheduled_at', e.target.value)}
                      className="border-white/10 bg-white/5"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="idea-notes">Cómo se lleva a cabo</Label>
                  <Textarea
                    id="idea-notes"
                    value={form.execution_notes}
                    onChange={(e) => setField('execution_notes', e.target.value)}
                    rows={3}
                    placeholder="Pasos, recursos necesarios, dependencias…"
                    className="border-white/10 bg-white/5"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pendingId === form.id}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar idea?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. También se borran sus votos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={handleDelete}
              disabled={pendingId === deleteId}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

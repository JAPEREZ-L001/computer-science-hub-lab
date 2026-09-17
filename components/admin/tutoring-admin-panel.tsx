'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil } from 'lucide-react'

import type { MentorCandidateRow, TutoringRequestAdminRow } from '@/src/lib/supabase/admin-queries'
import { updateTutoringRequest } from '@/app/admin/actions/tutoring'
import { formatSessionDate, toDateTimeLocalValue } from '@/src/lib/tutoring-display'
import { useToast } from '@/components/ui/use-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  matched: 'Emparejada',
  closed: 'Cerrada',
}

// Radix Select no admite value="" (lo reserva para "sin selección"), así que
// "sin asignar" usa este sentinel y se traduce a '' recién al enviar el form.
const UNASSIGNED = 'unassigned'

type FormState = {
  id: string
  status: string
  assigned_mentor_id: string
  session_location: string
  session_at: string
  mentor_notes: string
}

export function TutoringAdminPanel({
  initialRows,
  mentors,
}: {
  initialRows: TutoringRequestAdminRow[]
  mentors: MentorCandidateRow[]
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState<FormState | null>(null)
  // Solo lectura en el panel: lo escribe el alumno desde /comunidad/tutorias.
  const [reinforcementTopics, setReinforcementTopics] = useState<string | null>(null)

  const openEdit = (row: TutoringRequestAdminRow) => {
    setForm({
      id: row.id,
      status: row.status,
      assigned_mentor_id: row.assigned_mentor_id ?? UNASSIGNED,
      session_location: row.session_location ?? '',
      session_at: toDateTimeLocalValue(row.session_at),
      mentor_notes: row.mentor_notes ?? '',
    })
    setReinforcementTopics(row.reinforcement_topics)
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setPending(true)
    const res = await updateTutoringRequest({
      ...form,
      assigned_mentor_id: form.assigned_mentor_id === UNASSIGNED ? '' : form.assigned_mentor_id,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Solicitud actualizada' })
    setOpen(false)
    router.refresh()
  }

  const setField = (key: keyof FormState, value: string) =>
    setForm((f) => (f ? { ...f, [key]: value } : f))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tutorías</h1>
        <p className="text-sm text-zinc-400">Gestioná el estado y la asignación de mentor.</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Solicitante</TableHead>
              <TableHead className="text-zinc-300">Tema</TableHead>
              <TableHead className="text-zinc-300">Estado</TableHead>
              <TableHead className="text-zinc-300">Mentor asignado</TableHead>
              <TableHead className="text-zinc-300">Sesión</TableHead>
              <TableHead className="w-[80px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No hay solicitudes de tutoría.
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row) => (
                <TableRow key={row.id} className="border-white/10">
                  <TableCell className="max-w-[160px] truncate font-medium text-zinc-200">
                    {row.requester_name}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-zinc-400">{row.topic}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'closed' ? 'outline' : 'unlocked'}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">{row.assigned_mentor_name ?? '—'}</TableCell>
                  <TableCell className="max-w-[200px] text-xs text-zinc-400">
                    {row.session_at || row.session_location ? (
                      <>
                        <span className="block truncate">
                          {formatSessionDate(row.session_at) ?? 'Sin fecha'}
                        </span>
                        <span className="block truncate text-zinc-500">
                          {row.session_location ?? 'Sin aula'}
                        </span>
                      </>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-white"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-md">
          {form ? (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Editar solicitud de tutoría</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => setField('status', v)}>
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="matched">Emparejada</SelectItem>
                      <SelectItem value="closed">Cerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Mentor asignado</Label>
                  <Select
                    value={form.assigned_mentor_id}
                    onValueChange={(v) => setField('assigned_mentor_id', v)}
                  >
                    <SelectTrigger className="border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Sin asignar</SelectItem>
                      {mentors.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mentors.length === 0 ? (
                    <p className="text-xs text-zinc-500">
                      No hay mentores activos en el directorio todavía.
                    </p>
                  ) : null}
                </div>

                <div className="mt-2 border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Sesión
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    El alumno y el mentor ven esto en /comunidad/tutorias.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="tut-loc">Aula o lugar</Label>
                    <Input
                      id="tut-loc"
                      value={form.session_location}
                      onChange={(e) => setField('session_location', e.target.value)}
                      placeholder="Ej. Aula B-203, o enlace de Meet"
                      className="border-white/10 bg-white/5"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tut-at">Fecha y hora</Label>
                    <Input
                      id="tut-at"
                      type="datetime-local"
                      value={form.session_at}
                      onChange={(e) => setField('session_at', e.target.value)}
                      className="border-white/10 bg-white/5"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tut-notes">Seguimiento</Label>
                  <Textarea
                    id="tut-notes"
                    value={form.mentor_notes}
                    onChange={(e) => setField('mentor_notes', e.target.value)}
                    rows={3}
                    placeholder="Qué se cubrió, qué queda pendiente…"
                    className="border-white/10 bg-white/5"
                  />
                </div>

                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Temas que pidió reforzar
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-zinc-300">
                    {reinforcementTopics || 'El alumno todavía no especificó temas.'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

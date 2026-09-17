'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil } from 'lucide-react'

import type { MentorCandidateRow, TutoringRequestAdminRow } from '@/src/lib/supabase/admin-queries'
import { updateTutoringRequest } from '@/app/admin/actions/tutoring'
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

  const openEdit = (row: TutoringRequestAdminRow) => {
    setForm({
      id: row.id,
      status: row.status,
      assigned_mentor_id: row.assigned_mentor_id ?? UNASSIGNED,
    })
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setPending(true)
    const res = await updateTutoringRequest({
      id: form.id,
      status: form.status,
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
              <TableHead className="w-[80px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={5} className="text-center text-zinc-500">
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
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => (f ? { ...f, status: v } : f))}
                  >
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
                    onValueChange={(v) => setForm((f) => (f ? { ...f, assigned_mentor_id: v } : f))}
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

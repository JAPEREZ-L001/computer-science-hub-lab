'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react'

import type { EventAdminRow, EventRegistrantRow } from '@/src/lib/supabase/admin-queries'
import { deleteEvent, listEventRegistrants, saveEvent } from '@/app/admin/actions/events'
import { isEventPast, todayInHubTimeZone } from '@/src/lib/event-datetime'
import { useToast } from '@/components/ui/use-toast'

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
import { Switch } from '@/components/ui/switch'
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

const emptyForm = {
  id: '' as string | undefined,
  title: '',
  description: '',
  event_date: '',
  event_time: '09:00',
  speaker: '',
  type: 'otro',
  location: '',
  registration_url: '',
  published: true,
}

function WarningNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-300">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

export function EventsAdminPanel({ initialRows }: { initialRows: EventAdminRow[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventAdminRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EventAdminRow | null>(null)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [registrantsOf, setRegistrantsOf] = useState<EventAdminRow | null>(null)
  const [registrants, setRegistrants] = useState<EventRegistrantRow[] | null>(null)

  const openRegistrants = async (row: EventAdminRow) => {
    setRegistrantsOf(row)
    // `null` es "cargando"; una lista vacía es un resultado válido y distinto.
    setRegistrants(null)
    const res = await listEventRegistrants(row.id)
    if (!res.ok) {
      setRegistrantsOf(null)
      toast({
        variant: 'destructive',
        title: 'No se pudieron cargar los inscritos',
        description: res.message,
      })
      return
    }
    setRegistrants(res.registrants)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, id: undefined, event_date: todayInHubTimeZone() })
    setOpen(true)
  }

  const openEdit = (row: EventAdminRow) => {
    const datePart = row.event_date?.slice(0, 10) ?? ''
    setEditing(row)
    setForm({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      event_date: datePart,
      event_time: (row.event_time ?? '09:00').slice(0, 5),
      speaker: row.speaker ?? '',
      type: row.type,
      location: row.location ?? '',
      registration_url: row.registration_url ?? '',
      published: row.published,
    })
    setOpen(true)
  }

  // El admin puede hacer ambas cosas, pero no a ciegas.
  const dateIsPast = Boolean(form.event_date) && isEventPast({ date: form.event_date })
  const editingRegistrations = editing?.registrations_count ?? 0
  const unpublishingWithRegistrations =
    editing !== null && editing.published && !form.published && editingRegistrations > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const res = await saveEvent({
      id: form.id,
      title: form.title,
      description: form.description,
      event_date: form.event_date,
      event_time: form.event_time,
      speaker: form.speaker,
      type: form.type,
      location: form.location,
      registration_url: form.registration_url,
      published: form.published,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Guardado' })
    setOpen(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setPending(true)
    const res = await deleteEvent(deleteTarget.id)
    setPending(false)
    setDeleteTarget(null)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'Error', description: res.message })
      return
    }
    toast({ title: 'Eliminado' })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Eventos</h1>
          <p className="text-sm text-zinc-400">Calendario público del hub.</p>
        </div>
        <Button type="button" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo evento
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.02]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-300">Título</TableHead>
              <TableHead className="text-zinc-300">Fecha</TableHead>
              <TableHead className="text-zinc-300">Tipo</TableHead>
              <TableHead className="text-zinc-300">Publicado</TableHead>
              <TableHead className="text-zinc-300">Inscritos</TableHead>
              <TableHead className="w-[100px] text-right text-zinc-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  No hay eventos.
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((row) => {
                const rowIsPast = isEventPast({ date: row.event_date })
                return (
                  <TableRow key={row.id} className="border-white/10">
                    <TableCell className="max-w-[200px] truncate font-medium text-zinc-200">
                      {row.title}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      <span className={rowIsPast ? 'text-zinc-500' : undefined}>
                        {row.event_date} {row.event_time}
                      </span>
                      {rowIsPast && (
                        <span className="ml-2 rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                          Pasado
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-400">{row.type}</TableCell>
                    <TableCell className="text-zinc-400">
                      {row.published ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell className="tabular-nums text-zinc-400">
                      {row.registrations_count === 0 ? (
                        <span className="text-zinc-500">0</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openRegistrants(row)}
                          className={`underline decoration-dotted underline-offset-4 transition-colors hover:text-white ${
                            row.published ? 'text-zinc-300' : 'text-amber-400'
                          }`}
                          title={
                            row.published
                              ? 'Ver quiénes se inscribieron'
                              : 'Tiene inscritos pero no está publicado — ver quiénes'
                          }
                        >
                          {row.registrations_count}
                        </button>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-red-400"
                        onClick={() => setDeleteTarget(row)}
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
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{form.id ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ev-title">Título</Label>
                <Input
                  id="ev-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ev-desc">Descripción</Label>
                <Textarea
                  id="ev-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="ev-date">Fecha</Label>
                  <Input
                    id="ev-date"
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                    required
                    className="border-white/10 bg-white/5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ev-time">Hora</Label>
                  <Input
                    id="ev-time"
                    type="time"
                    value={form.event_time}
                    onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))}
                    className="border-white/10 bg-white/5"
                  />
                </div>
              </div>
              {dateIsPast && (
                <WarningNote>
                  La fecha ya pasó. Publicado, el evento va directo al historial de
                  /eventos y no acepta inscripciones.
                </WarningNote>
              )}
              <div className="grid gap-2">
                <Label htmlFor="ev-speaker">Ponente (opcional)</Label>
                <Input
                  id="ev-speaker"
                  value={form.speaker}
                  onChange={(e) => setForm((f) => ({ ...f, speaker: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="border-white/10 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="charla">Charla</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="copa">Copa</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ev-loc">Lugar</Label>
                <Input
                  id="ev-loc"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ev-reg">URL inscripción (opcional)</Label>
                <Input
                  id="ev-reg"
                  value={form.registration_url}
                  onChange={(e) => setForm((f) => ({ ...f, registration_url: e.target.value }))}
                  className="border-white/10 bg-white/5"
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                <Label htmlFor="ev-pub" className="cursor-pointer">
                  Publicado
                </Label>
                <Switch
                  id="ev-pub"
                  checked={form.published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                />
              </div>
              {editing !== null && editingRegistrations > 0 && (
                <p className="text-xs text-zinc-400">
                  {editingRegistrations === 1
                    ? '1 persona inscrita a este evento.'
                    : editingRegistrations + ' personas inscritas a este evento.'}
                </p>
              )}
              {unpublishingWithRegistrations && (
                <WarningNote>
                  Estás despublicando un evento con {editingRegistrations}{' '}
                  {editingRegistrations === 1 ? 'inscrito' : 'inscritos'}. Dejará de verse
                  en /eventos, pero las inscripciones se conservan y nadie recibe aviso
                  automático.
                </WarningNote>
              )}
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
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(registrantsOf)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRegistrantsOf(null)
            setRegistrants(null)
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Inscritos</DialogTitle>
          </DialogHeader>

          {registrantsOf ? (
            <p className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">{registrantsOf.title}</span> ·{' '}
              {registrantsOf.event_date}
            </p>
          ) : null}

          {registrantsOf && !registrantsOf.published ? (
            <WarningNote>
              Este evento no está publicado, así que estas personas no lo ven en la página
              pública aunque estén inscritas.
            </WarningNote>
          ) : null}

          <div className="py-2">
            {registrants === null ? (
              <p className="py-6 text-center text-sm text-zinc-500">Cargando inscritos…</p>
            ) : registrants.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                Nadie inscrito todavía.
              </p>
            ) : (
              <ol className="divide-y divide-white/[0.06]">
                {registrants.map((person, index) => (
                  <li
                    key={person.user_id}
                    className="flex items-start justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        <span className="mr-2 tabular-nums text-zinc-600">{index + 1}.</span>
                        {person.display_name}
                        {person.profile_missing ? (
                          <span
                            className="ml-2 rounded-full border border-amber-500/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-amber-400"
                            title="La inscripción existe pero el usuario no tiene fila en profiles"
                          >
                            sin perfil
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {person.email ?? 'Sin email'}
                        {person.career ? ` · ${person.career}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-zinc-600">
                      {person.registered_at.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRegistrantsOf(null)
                setRegistrants(null)
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent className="border-white/10 bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {deleteTarget && deleteTarget.registrations_count > 0 ? (
                <>
                  Se eliminará{' '}
                  <span className="font-medium text-zinc-200">{deleteTarget.title}</span> junto
                  con sus {deleteTarget.registrations_count}{' '}
                  {deleteTarget.registrations_count === 1 ? 'inscripción' : 'inscripciones'}.
                  Esta acción no se puede deshacer.
                </>
              ) : (
                'Esta acción no se puede deshacer.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={handleDelete}
              disabled={pending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

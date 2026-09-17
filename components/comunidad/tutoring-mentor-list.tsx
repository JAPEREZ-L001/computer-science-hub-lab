'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, CheckCircle2, MapPin, Target, User } from 'lucide-react'

import type { MentorTutoringRow } from '@/src/lib/supabase/community-queries'
import { updateMentorSession } from '@/app/comunidad/actions'
import {
  TUTORING_STAGE_LABELS,
  formatSessionDate,
  resolveTutoringStage,
  toDateTimeLocalValue,
} from '@/src/lib/tutoring-display'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const STAGE_STYLES: Record<string, string> = {
  pending: 'border-white/15 bg-white/[0.04] text-white/50',
  awaiting_schedule: 'border-amber-500/30 bg-amber-500/10 text-amber-200/90',
  scheduled: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200/90',
  closed: 'border-white/10 bg-white/[0.02] text-white/35',
}

function MentorCard({ request }: { request: MentorTutoringRow }) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [location, setLocation] = useState(request.session_location ?? '')
  const [sessionAt, setSessionAt] = useState(toDateTimeLocalValue(request.session_at))
  const [notes, setNotes] = useState(request.mentor_notes ?? '')

  const stage = resolveTutoringStage(request)
  const sessionDate = formatSessionDate(request.session_at)

  const save = async (status: 'matched' | 'closed') => {
    setPending(true)
    const res = await updateMentorSession({
      id: request.id,
      session_location: location,
      session_at: sessionAt,
      mentor_notes: notes,
      status,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo guardar', description: res.message })
      return
    }
    toast({ title: status === 'closed' ? 'Tutoría finalizada' : 'Sesión actualizada' })
    setEditing(false)
    router.refresh()
  }

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{request.topic}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
            <User className="h-3 w-3" />
            {request.student_name}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${STAGE_STYLES[stage]}`}
        >
          {TUTORING_STAGE_LABELS[stage]}
        </span>
      </div>

      {request.details ? (
        <p className="mt-3 whitespace-pre-line text-sm text-white/50">{request.details}</p>
      ) : null}

      {/* Lo que el alumno pidió reforzar: es la razón de ser de la sesión. */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-4">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <Target className="h-3 w-3" />
          Temas que pidió reforzar
        </p>
        <p className="mt-2 whitespace-pre-line text-sm text-white/60">
          {request.reinforcement_topics || 'El alumno todavía no especificó temas.'}
        </p>
        {request.preferred_schedule ? (
          <p className="mt-3 text-xs text-white/35">
            Disponibilidad indicada: {request.preferred_schedule}
          </p>
        ) : null}
      </div>

      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            save('matched')
          }}
          className="mt-4 space-y-4 rounded-xl border border-white/[0.08] bg-black/30 p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`loc-${request.id}`} className="text-xs text-white/50">
                Aula o lugar
              </Label>
              <Input
                id={`loc-${request.id}`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Aula B-203, o enlace de Meet"
                className="border-white/[0.08] bg-black/40 text-sm text-white placeholder:text-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`at-${request.id}`} className="text-xs text-white/50">
                Fecha y hora
              </Label>
              <Input
                id={`at-${request.id}`}
                type="datetime-local"
                value={sessionAt}
                onChange={(e) => setSessionAt(e.target.value)}
                className="border-white/[0.08] bg-black/40 text-sm text-white"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`notes-${request.id}`} className="text-xs text-white/50">
              Seguimiento
            </Label>
            <Textarea
              id={`notes-${request.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Qué se cubrió, qué queda pendiente para la próxima…"
              className="border-white/[0.08] bg-black/40 text-sm text-white placeholder:text-white/20"
            />
            <p className="text-xs text-white/30">El alumno también ve estas notas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" size="sm" disabled={pending} className="rounded-full px-5">
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              className="gap-1.5 rounded-full border-white/15 bg-transparent px-4"
              onClick={() => save('closed')}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Marcar finalizada
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full text-white/50"
              onClick={() => {
                setLocation(request.session_location ?? '')
                setSessionAt(toDateTimeLocalValue(request.session_at))
                setNotes(request.mentor_notes ?? '')
                setEditing(false)
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-4 space-y-2.5">
            <p className="flex items-center gap-2 text-sm text-white/70">
              <CalendarDays className="h-4 w-4 shrink-0 text-white/40" />
              {sessionDate ?? <span className="text-amber-200/70">Sin fecha asignada</span>}
            </p>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4 shrink-0 text-white/40" />
              {request.session_location ?? <span className="text-amber-200/70">Sin aula asignada</span>}
            </p>
          </div>

          {request.mentor_notes ? (
            <p className="mt-3 whitespace-pre-line rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/55">
              {request.mentor_notes}
            </p>
          ) : null}

          {request.status !== 'closed' ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-4 rounded-full border-white/15 bg-transparent px-5"
              onClick={() => setEditing(true)}
            >
              {request.session_at && request.session_location ? 'Editar sesión' : 'Agendar sesión'}
            </Button>
          ) : null}
        </>
      )}
    </li>
  )
}

export function TutoringMentorList({ requests }: { requests: MentorTutoringRow[] }) {
  if (requests.length === 0) {
    return (
      <p className="mt-3 text-sm text-white/40">
        Todavía no te asignaron tutorías. Coordinación te asigna desde el panel.
      </p>
    )
  }

  return (
    <ul className="mt-4 space-y-4">
      {requests.map((r) => (
        <MentorCard key={r.id} request={r} />
      ))}
    </ul>
  )
}

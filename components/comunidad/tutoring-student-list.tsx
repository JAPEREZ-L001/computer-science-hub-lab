'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, MapPin, NotebookPen, Pencil, UserCheck } from 'lucide-react'

import type { TutoringRequestRow } from '@/src/lib/supabase/community-queries'
import { updateReinforcementTopics } from '@/app/comunidad/actions'
import {
  TUTORING_STAGE_LABELS,
  formatSessionDate,
  resolveTutoringStage,
} from '@/src/lib/tutoring-display'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const STAGE_STYLES: Record<string, string> = {
  pending: 'border-white/15 bg-white/[0.04] text-white/50',
  awaiting_schedule: 'border-amber-500/30 bg-amber-500/10 text-amber-200/90',
  scheduled: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200/90',
  closed: 'border-white/10 bg-white/[0.02] text-white/35',
}

function TutoringCard({ request }: { request: TutoringRequestRow }) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const [topics, setTopics] = useState(request.reinforcement_topics ?? '')

  const stage = resolveTutoringStage(request)
  const sessionDate = formatSessionDate(request.session_at)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    const res = await updateReinforcementTopics({
      id: request.id,
      reinforcement_topics: topics,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo guardar', description: res.message })
      return
    }
    toast({ title: 'Temas actualizados' })
    setEditing(false)
    router.refresh()
  }

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{request.topic}</p>
          <p className="mt-0.5 text-xs text-white/35">
            Enviada el {new Date(request.created_at).toLocaleDateString('es-SV')}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${STAGE_STYLES[stage]}`}
        >
          {TUTORING_STAGE_LABELS[stage]}
        </span>
      </div>

      {stage === 'pending' ? (
        <p className="mt-4 text-sm text-white/40">
          Todavía no hay mentor asignado. Te avisamos cuando haya match.
        </p>
      ) : (
        <div className="mt-4 space-y-2.5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <UserCheck className="h-4 w-4 shrink-0 text-emerald-400/80" />
            <span className="text-white/40">Mentor:</span>
            <span className="font-medium text-white">{request.mentor_name ?? 'Por asignar'}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <CalendarDays className="h-4 w-4 shrink-0 text-white/40" />
            <span className="text-white/40">Cuándo:</span>
            {sessionDate ? (
              <span className="font-medium text-white">{sessionDate}</span>
            ) : (
              <span className="text-amber-200/70">Tu mentor todavía no fijó la fecha</span>
            )}
          </p>
          <p className="flex items-center gap-2 text-sm text-white/70">
            <MapPin className="h-4 w-4 shrink-0 text-white/40" />
            <span className="text-white/40">Dónde:</span>
            {request.session_location ? (
              <span className="font-medium text-white">{request.session_location}</span>
            ) : (
              <span className="text-amber-200/70">Aula por confirmar</span>
            )}
          </p>
        </div>
      )}

      {/* Temas a reforzar: lo único que el alumno controla después del match. */}
      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            Temas que querés reforzar
          </p>
          {!editing && request.status !== 'closed' ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-white"
            >
              <Pencil className="h-3 w-3" />
              {request.reinforcement_topics ? 'Editar' : 'Agregar'}
            </button>
          ) : null}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-2 space-y-3">
            <Textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Ej. Listas enlazadas, complejidad de búsqueda binaria, ejercicios del parcial 2…"
              className="rounded-xl border-white/[0.08] bg-black/40 text-sm text-white placeholder:text-white/20 focus:border-white/30"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={pending} className="rounded-full px-5">
                {pending ? 'Guardando…' : 'Guardar'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-white/50"
                onClick={() => {
                  setTopics(request.reinforcement_topics ?? '')
                  setEditing(false)
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-2 whitespace-pre-line text-sm text-white/55">
            {request.reinforcement_topics || 'Todavía no agregaste temas. Ayudan al mentor a preparar la sesión.'}
          </p>
        )}
      </div>

      {request.mentor_notes ? (
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <NotebookPen className="h-3 w-3" />
            Seguimiento del mentor
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-white/60">{request.mentor_notes}</p>
        </div>
      ) : null}
    </li>
  )
}

export function TutoringStudentList({ requests }: { requests: TutoringRequestRow[] }) {
  if (requests.length === 0) {
    return <p className="mt-3 text-sm text-white/40">Todavía no enviaste solicitudes.</p>
  }

  return (
    <ul className="mt-4 space-y-4">
      {requests.map((r) => (
        <TutoringCard key={r.id} request={r} />
      ))}
    </ul>
  )
}

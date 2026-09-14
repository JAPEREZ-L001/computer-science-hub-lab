'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react'

import { submitTutoringRequest } from '@/app/comunidad/actions'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const SCHEDULE_OPTIONS = [
  'Lunes y miércoles tarde',
  'Martes y jueves mañana',
  'Viernes tarde',
  'Fines de semana',
  'Flexible — cualquier día',
] as const

const STEPS = [
  { icon: BookOpen, label: 'Tema', desc: '¿Sobre qué necesitás ayuda?' },
  { icon: MessageSquare, label: 'Contexto', desc: 'Contanos más sobre tu situación' },
  { icon: Calendar, label: 'Horario', desc: '¿Cuándo estás disponible?' },
] as const

export function TutoringRequestForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const [topic, setTopic] = useState('')
  const [details, setDetails] = useState('')
  const [schedule, setSchedule] = useState('')

  const canNext = step === 0 ? topic.trim().length > 0 : true

  const onNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setPending(true)
    const res = await submitTutoringRequest({
      topic,
      details,
      preferred_schedule: schedule,
    })
    setPending(false)
    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo enviar', description: res.message })
      return
    }
    setDone(true)
    router.refresh()
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <div>
          <h3 className="text-xl font-bold text-white">Solicitud enviada</h3>
          <p className="mt-2 text-sm text-white/50">El equipo te contactará cuando haya match con un mentor.</p>
        </div>
        <button
          type="button"
          onClick={() => { setDone(false); setStep(0); setTopic(''); setDetails(''); setSchedule('') }}
          className="rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
        >
          Nueva solicitud
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Stepper header */}
      <div className="flex border-b border-white/[0.06]">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isDone = i < step
          return (
            <div
              key={s.label}
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 px-2 text-center transition-colors duration-300 ${
                isActive ? 'bg-white/[0.03]' : ''
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : isActive
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/[0.08] bg-transparent text-white/20'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] hidden sm:block ${
                isActive ? 'text-white/80' : isDone ? 'text-emerald-400/70' : 'text-white/20'
              }`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <form onSubmit={onNext} className="p-6 sm:p-8">
        <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
          Paso {step + 1} de {STEPS.length} — {STEPS[step].desc}
        </p>

        {step === 0 && (
          <div className="space-y-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              autoFocus
              className="h-14 rounded-2xl border-white/[0.08] bg-black/40 text-base font-medium text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/[0.05]"
              placeholder="Ej. Estructuras de datos, React, cálculo diferencial…"
            />
            <p className="text-xs text-white/30">Sé específico: cuanto más claro, mejor el match.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              autoFocus
              className="rounded-2xl border-white/[0.08] bg-black/40 text-sm font-medium text-white placeholder:text-white/20 focus:border-white/30 focus:ring-white/[0.05] resize-none"
              placeholder="¿Qué ya intentaste? ¿Hay un proyecto o examen en particular? ¿Cuál es tu nivel actual?"
            />
            <p className="text-xs text-white/30">El contexto ayuda al mentor a prepararse.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {SCHEDULE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSchedule(schedule === opt ? '' : opt)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                    schedule === opt
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/[0.08] bg-white/[0.02] text-white/40 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30">También podés dejar vacío si tenés horario flexible.</p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white disabled:opacity-0"
          >
            <ArrowLeft className="h-3 w-3" />
            Atrás
          </button>

          <Button
            type="submit"
            disabled={!canNext || pending}
            className="rounded-full px-8 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            {pending
              ? 'Enviando…'
              : step < STEPS.length - 1
              ? (
                <>
                  Siguiente
                  <ArrowRight className="ml-2 h-3 w-3" />
                </>
              )
              : 'Enviar solicitud'}
          </Button>
        </div>
      </form>
    </div>
  )
}

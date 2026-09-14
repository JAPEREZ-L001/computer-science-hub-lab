"use client"

import { useState } from "react"
import { ArrowRight, Check } from "lucide-react"

import { AuthGateModal } from "@/components/auth-gate-modal"
import { useAuthSession } from "@/components/providers/auth-session-provider"
import { toast } from "@/hooks/use-toast"
import { submitInterest } from "@/app/actions/interests"

type GoalOption = "apoyo" | "comunidad" | "profesional"

const goalOptions: { id: GoalOption; title: string; description: string }[] = [
  {
    id: "apoyo",
    title: "Apoyo académico",
    description: "Quiero acompañamiento con materias y exámenes.",
  },
  {
    id: "comunidad",
    title: "Comunidad y liderazgo",
    description: "Quiero participar en comités, eventos u organización.",
  },
  {
    id: "profesional",
    title: "Proyección profesional",
    description: "Quiero preparar portafolio, CV o acercarme a la industria.",
  },
]

export function MicroIntakeForm({ variant = "home" }: { variant?: "home" | "programas" }) {
  const { isAuthenticated, user } = useAuthSession()
  const [goals, setGoals] = useState<GoalOption[]>([])
  const [name, setName] = useState(() =>
    (user?.user_metadata?.full_name as string | undefined) ?? ""
  )
  const [email, setEmail] = useState(() => user?.email ?? "")
  const [detail, setDetail] = useState("")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const title =
    variant === "home"
      ? "¿Te sumas a construir el Hub?"
      : "Decinos en qué programa te gustaría involucrarte"

  const subtitle =
    variant === "home"
      ? "Únete a una red de estudiantes apasionados que construyen en el mundo real. Este es el primer paso: en menos de un minuto nos das contexto para poder contactarte con la iniciativa correcta."
      : "Usamos esta información para conectarte con el programa que mejor encaje con tu momento actual y tu carrera."

  const toggleGoal = (goal: GoalOption) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (goals.length === 0) return

    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    setPending(true)
    const res = await submitInterest({ name, email, goals, detail })
    setPending(false)

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar",
        description: res.message,
      })
      return
    }

    toast({
      title: "Interés enviado",
      description: "Nos pondremos en contacto pronto.",
    })
    setGoals([])
    setDetail("")
    setName("")
    setEmail("")
  }

  return (
    <section id="join" className="relative border-y border-white/[0.06] bg-[#050505] py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 z-10">
        <div className="mb-12 text-center">
          <p className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Primer paso
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed font-medium text-white/50">
            {subtitle}
          </p>
        </div>

        <form className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-10 shadow-2xl backdrop-blur-xl" onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 ml-1">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/[0.08] bg-black/40 px-4 text-sm font-medium text-white placeholder:text-white/20 transition-all focus:border-white/30 focus:bg-white/[0.02] focus:outline-none focus:ring-4 focus:ring-white/[0.05]"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 ml-1">
                Correo personal
              </label>
              <input
                type="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/[0.08] bg-black/40 px-4 text-sm font-medium text-white placeholder:text-white/20 transition-all focus:border-white/30 focus:bg-white/[0.02] focus:outline-none focus:ring-4 focus:ring-white/[0.05]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-8 mt-8">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 ml-1">
              ¿Qué te interesa ahora mismo?{" "}
              <span className="opacity-50">
                (opción múltiple)
              </span>
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              {goalOptions.map((option) => {
                const isSelected = goals.includes(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleGoal(option.id)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-300 ${
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-500/10 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        : "border-white/[0.06] bg-white/[0.01] text-white/50 hover:border-white/[0.15] hover:bg-white/[0.04]"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="mb-4 flex items-center justify-between w-full">
                      <span className={`block font-bold text-[10px] uppercase tracking-[0.16em] ${isSelected ? 'text-emerald-400' : 'text-white/70 group-hover:text-white'}`}>
                        {option.title}
                      </span>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-white/[0.08] bg-transparent transition-colors group-hover:border-white/30'}`}>
                        {isSelected && <Check className="h-3 w-3 text-[#0D0D0D]" />}
                      </div>
                    </div>
                    <span className="text-xs font-medium leading-relaxed">{option.description}</span>
                  </button>
                )
              })}
            </div>
            {goals.length === 0 && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1 ml-1">
                Debes seleccionar al menos una ruta prioritaria.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-8 mt-8">
            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 ml-1">
              Comentarios adicionales <span className="text-white/30 lowercase normal-case tracking-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Cuéntanos sobre tus materias actuales o proyectos..."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/40 p-4 text-sm font-medium text-white placeholder:text-white/20 transition-all focus:border-white/30 focus:bg-white/[0.02] focus:outline-none focus:ring-4 focus:ring-white/[0.05]"
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row pt-4">
            <AuthGateModal
              open={authModalOpen}
              onOpenChange={setAuthModalOpen}
              actionLabel="enviar tu solicitud de ruta"
              returnTo="/#join"
            />
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 text-center sm:text-left sm:max-w-[200px]">
              Tus datos solo se usan internamente.
            </p>
            <button
              type="submit"
              disabled={goals.length === 0 || pending}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {pending ? "Transfiriendo..." : "Trazar mi ruta"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

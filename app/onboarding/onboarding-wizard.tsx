"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { completeOnboardingAction } from "@/app/actions/onboarding"
import type { MemberProfile, UniversityCode, UniversityRole } from "@/src/types"

// ─────────────────────────────────────────────────────────────
// Datos estáticos de universidades (CSH-S0-007)
// ─────────────────────────────────────────────────────────────

const UNIVERSITIES: { code: UniversityCode; label: string }[] = [
  { code: 'UDB',  label: 'Universidad Don Bosco (UDB)' },
  { code: 'UCA',  label: 'Universidad Centroamericana (UCA)' },
  { code: 'UES',  label: 'Universidad de El Salvador (UES)' },
  { code: 'UFG',  label: 'Universidad Francisco Gavidia (UFG)' },
  { code: 'UEES', label: 'Universidad Evangélica (UEES)' },
  { code: 'ESEN', label: 'Escuela Superior de Economía y Negocios (ESEN)' },
]

// ─────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────

export function OnboardingWizard({ profile }: { profile: MemberProfile | null }) {
  const router = useRouter()
  const { toast } = useToast()

  const TOTAL_STEPS = 4
  const [step, setStep]     = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    bio:            profile?.bio     || "",
    github:         profile?.github  || "",
    linkedin:       profile?.linkedin || "",
    // CSH-S0-006
    universityRole: (profile?.universityRole || "estudiante") as UniversityRole,
    // CSH-S0-007
    university:     (profile?.university || "UDB") as UniversityCode,
  })

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleFinish = async () => {
    setLoading(true)
    const formDataObj = new FormData()
    formDataObj.append("bio",            formData.bio)
    formDataObj.append("github",         formData.github)
    formDataObj.append("linkedin",       formData.linkedin)
    formDataObj.append("universityRole", formData.universityRole)
    formDataObj.append("university",     formData.university)

    const result = await completeOnboardingAction(formDataObj)
    setLoading(false)

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" })
      return
    }

    toast({ title: "¡Bienvenido al CSH!", description: "Has ganado 5 puntos de reputación iniciales." })
    router.refresh()
    router.push("/perfil")
  }

  const inputBase =
    "w-full flex h-12 rounded-full border border-white/[0.08] bg-black/50 px-5 py-2 text-sm text-white placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-colors"

  const selectBase =
    "w-full flex h-12 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 transition-colors appearance-none cursor-pointer"

  const roleBtn = (value: UniversityRole, label: string, emoji: string) => {
    const isActive = formData.universityRole === value
    return (
      <button
        type="button"
        onClick={() => setFormData({ ...formData, universityRole: value })}
        className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border py-6 px-4 text-sm font-bold transition-all duration-200 ${
          isActive
            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
            : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/[0.15] hover:text-white/80'
        }`}
      >
        <span className="text-3xl">{emoji}</span>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
      {/* Barra de progreso */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/[0.05]">
        <div
          className="h-full bg-cyan-400 transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Indicador de paso */}
      <div className="text-center mb-12 mt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
          Paso {step} de {TOTAL_STEPS}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {step === 1 && "Te damos la bienvenida al Hub"}
          {step === 2 && "Tus redes de desarrollo"}
          {step === 3 && "Tu perfil universitario"}
          {step === 4 && "Último paso"}
        </h1>
        <p className="text-sm font-medium text-white/50">
          Completa este proceso para activar tu perfil y empezar a ganar reputación.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-8 min-h-[280px]">

        {/* Paso 1: Bio */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">
                Breve biografía <span className="font-normal normal-case text-white/30">(Opcional pero recomendado)</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Ej. Soy estudiante de 5to ciclo. Me apasiona el desarrollo web y estoy aprendiendo Next.js."
                className="w-full flex min-h-[120px] rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 resize-none transition-colors"
              />
            </div>
            <p className="text-[10px] text-white/30 text-center leading-relaxed">
              La comunidad usa este campo para saber en qué áreas estás trabajando y qué te gusta.
            </p>
          </div>
        )}

        {/* Paso 2: Redes sociales */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">GitHub URL</label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/tu-usuario"
                className={inputBase}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/tu-usuario"
                className={inputBase}
              />
            </div>
          </div>
        )}

        {/* Paso 3: Universidad y rol (CSH-S0-006 + CSH-S0-007) */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Rol universitario */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">
                ¿Cuál es tu rol en la universidad?
              </label>
              <div className="flex gap-3">
                {roleBtn('estudiante',   'Estudiante',   '📚')}
                {roleBtn('catedratico',  'Catedrático',  '🎓')}
              </div>
            </div>

            {/* Universidad */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50">
                ¿De qué universidad sos?
              </label>
              <div className="relative">
                <select
                  id="onboarding-university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value as UniversityCode })}
                  className={selectBase}
                >
                  {UNIVERSITIES.map((u) => (
                    <option key={u.code} value={u.code} className="bg-[#111] text-white">
                      {u.label}
                    </option>
                  ))}
                </select>
                {/* Flecha decorativa */}
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/30">
                  ▾
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-white">¡Todo listo!</h3>
            <p className="text-sm text-white/60 font-medium">
              Al finalizar, ganarás tus primeros{' '}
              <strong className="text-cyan-400">5 puntos de reputación</strong> por activar tu
              cuenta y accederás a tu Dashboard y al sistema de Tutorías.
            </p>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Resumen</p>
              <p className="text-sm text-white/70">
                <span className="text-white/40">Rol:</span>{' '}
                {formData.universityRole === 'estudiante' ? '📚 Estudiante' : '🎓 Catedrático'}
              </p>
              <p className="text-sm text-white/70">
                <span className="text-white/40">Universidad:</span> {formData.university}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/[0.06]">
        {step > 1 ? (
          <button
            onClick={prevStep}
            disabled={loading}
            className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            Atrás
          </button>
        ) : <div />}

        {step < TOTAL_STEPS ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#0D0D0D] transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Siguiente <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex items-center gap-3 rounded-full bg-cyan-500 px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-[#050505] transition-all hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Completando..." : "Entrar al Hub"}
          </button>
        )}
      </div>
    </div>
  )
}

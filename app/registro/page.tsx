'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { CshDeltaMark } from '@/components/csh-delta-mark'
import { AuthCard } from '@/components/auth-card'
import { InputField } from '@/components/input-field'
import { PasswordInput } from '@/components/password-input'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/src/lib/supabase/client'
import { getPublicSiteUrl } from '@/src/lib/site-url'
import { newPasswordSchema } from '@/src/lib/schemas/password'

function safeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/perfil'
  }
  return raw
}

const careerOptions = [
  'Ing. en Ciencias de la Computación',
  'Licenciatura en Ingeniería de Software',
  'Ing. en Sistemas Informáticos',
  'Licenciatura en Diseño de Experiencias Digitales',
  'Ing. Industrial',
  'Ingeniería en Desarrollo de Contenidos Digitales y Robótica Aplicada',
] as const

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Ingresa tu nombre completo')
      .regex(/^[a-zA-ZÁ-ÿ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    email: z.string().email('Ingresa un email válido'),
    personalEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email('Ingresa un email válido')
      .optional()
      .or(z.literal('')),
    career: z.enum(careerOptions),
    cycle: z.coerce
      .number()
      .int('El ciclo debe ser un número entero')
      .min(1, 'El ciclo debe estar entre 1 y 10')
      .max(10, 'El ciclo debe estar entre 1 y 10'),
    password: newPasswordSchema,
    confirmPassword: z.string().min(8, 'Confirma tu contraseña'),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'Debes aceptar los términos para continuar',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

type RegisterValues = z.infer<typeof registerSchema>

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get('redirect'))
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      personalEmail: '',
      career: careerOptions[0],
      cycle: 1,
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onSubmit',
  })

  const onSubmit = async (values: RegisterValues) => {
    const supabase = createClient()
    const origin = getPublicSiteUrl()

    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: values.fullName.trim(),
          career: values.career,
          cycle: values.cycle,
          area: 'general',
          personal_email: values.personalEmail?.trim() || undefined,
        },
      },
    })

    if (error) {
      const isRateLimit =
        error.status === 429 ||
        error.message?.toLowerCase().includes('security purposes') ||
        error.message?.toLowerCase().includes('rate limit')

      toast({
        variant: 'destructive',
        title: isRateLimit ? 'Demasiados intentos' : 'No se pudo registrar',
        description: isRateLimit
          ? 'Por seguridad, esperá un momento antes de intentar nuevamente.'
          : error.message,
      })
      return
    }

    if (data.session) {
      router.refresh()
      router.push(redirectTo)
      return
    }

    toast({
      title: '✉️ Confirmá tu correo',
      description:
        'Te enviamos un email de confirmación desde noreply@cshdevs.org. Revisá tu bandeja de entrada y confirmá tu cuenta para poder iniciar sesión.',
    })
    
    reset()
  }

  const inputFormStyleOverrides = "[&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.2em] [&_label]:text-white/50 [&_input]:h-12 [&_input]:rounded-2xl [&_input]:border-white/[0.08] [&_input]:bg-black/40 [&_input]:text-sm [&_input]:font-medium [&_input]:text-white [&_input]:placeholder-white/20 [&_input:focus]:border-white/30 [&_input:focus]:bg-white/[0.02] [&_input:focus]:ring-4 [&_input:focus]:ring-white/[0.05] [&_input]:transition-all"

  return (
    <div className="w-full min-w-0 max-w-xl">
      <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:mb-10 sm:gap-4">
        <CshDeltaMark
          aria-label="CSH Logo"
          className="h-12 w-12 shrink-0 object-contain text-white"
        />
        <div className="text-center">
          <p className="font-bold tracking-[0.25em] text-[11px] uppercase text-white/90">
            Computer Science Hub
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">Inscripción Oficial</p>
        </div>
      </div>

      <AuthCard
        title="Crea tu cuenta"
        description="Sé parte de la nueva red de ingenieros."
        innerMaxWidthClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={`min-w-0 ${inputFormStyleOverrides}`}>
              <InputField
                label="Nombre completo"
                id="register-fullName"
                placeholder="Ej. Ana María López"
                error={errors.fullName?.message}
                autoComplete="name"
                {...register('fullName')}
              />
            </div>

            <div className={`min-w-0 ${inputFormStyleOverrides}`}>
              <InputField
                label="Correo institucional"
                id="register-email"
                type="email"
                placeholder="alumno@udb.edu.sv"
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2">
            <div className={`min-w-0 ${inputFormStyleOverrides}`}>
              <InputField
                label="Correo personal (opcional)"
                id="register-personalEmail"
                type="email"
                placeholder="tuemail@gmail.com"
                error={errors.personalEmail?.message}
                autoComplete="email"
                {...register('personalEmail')}
              />
            </div>
            <p className="text-[10px] font-medium leading-relaxed text-white/30 ml-1">
              Te sirve como respaldo si perdés acceso a tu correo institucional (ej. al graduarte). No lo compartimos ni lo usamos para nada más.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="grid min-w-0 gap-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 ml-1" htmlFor="register-career">
                Carrera
              </label>
              <select
                id="register-career"
                className={`h-12 w-full rounded-2xl border bg-black/40 px-4 text-sm font-medium text-white transition-all focus:border-white/30 focus:bg-white/[0.02] focus:outline-none focus:ring-4 focus:ring-white/[0.05] ${
                  errors.career ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08]'
                }`}
                {...register('career')}
              >
                {careerOptions.map((c) => (
                  <option key={c} value={c} className="bg-[#0A0A0A] text-white py-2">
                    {c}
                  </option>
                ))}
              </select>
              {errors.career ? (
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mt-1 ml-1" role="alert">
                  {errors.career.message}
                </p>
              ) : null}
            </div>

            <div className={`min-w-0 ${inputFormStyleOverrides}`}>
              <InputField
                label="Ciclo actual (1-10)"
                id="register-cycle"
                type="number"
                placeholder="Ej. 4"
                error={errors.cycle?.message}
                inputMode="numeric"
                {...register('cycle')}
              />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={`min-w-0 ${inputFormStyleOverrides}`}>
              <PasswordInput
                label="Contraseña segura"
                placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                error={errors.password?.message}
                inputProps={register('password')}
              />
            </div>

            <div className={`min-w-0 ${inputFormStyleOverrides}`}>
              <PasswordInput
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña secreta"
                error={errors.confirmPassword?.message}
                inputProps={register('confirmPassword')}
              />
            </div>
          </div>

          <div className="grid gap-2 border-t border-white/[0.06] pt-6 mt-4">
            <label className="flex items-start gap-3 text-xs leading-relaxed font-medium text-white/40 hover:text-white/60 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500/20" 
                {...register('acceptTerms')} 
              />
              Confirmo que pertenezco a la comunidad estudiantil del Computer Science Hub.
            </label>
            {errors.acceptTerms ? (
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mt-1" role="alert">
                {errors.acceptTerms.message}
              </p>
            ) : null}
          </div>

          <button 
            type="submit" 
            className="btn-press flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:hover:scale-100 mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner className="h-4 w-4 bg-black" /> : null}
            Crear mi cuenta de acceso
          </button>

          <div className="flex flex-col gap-4 text-center mt-6">
            <Link
              href="/login"
              className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 hover:text-white/70 transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="absolute -top-[10%] -left-[10%] h-[60vw] max-h-[800px] w-[60vw] max-w-[800px] animate-pulse rounded-full bg-emerald-500/5 blur-[120px]" style={{ animationDuration: '8s' }} />
        <div className="absolute -right-[10%] -bottom-[10%] h-[60vw] max-h-[800px] w-[60vw] max-w-[800px] animate-pulse rounded-full bg-blue-500/5 blur-[120px]" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-7xl items-start justify-center px-4 py-12 sm:items-center sm:py-20 md:py-24">
        <Suspense
          fallback={
            <div className="flex w-full max-w-md justify-center py-12">
              <Spinner className="h-8 w-8 text-white/20" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  )
}

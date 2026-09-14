'use client'

import Link from 'next/link'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MailCheck } from 'lucide-react'

import { toast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'

import { CshDeltaMark } from '@/components/csh-delta-mark'
import { AuthCard } from '@/components/auth-card'
import { InputField } from '@/components/input-field'
import { createClient } from '@/src/lib/supabase/client'
import { getPublicSiteUrl } from '@/src/lib/site-url'

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
})

type Values = z.infer<typeof schema>

const fieldStyles =
  '[&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.2em] [&_label]:text-white/50 [&_input]:h-12 [&_input]:rounded-2xl [&_input]:border-white/[0.08] [&_input]:bg-black/40 [&_input]:text-sm [&_input]:font-medium [&_input]:text-white [&_input]:placeholder-white/20 [&_input:focus]:border-white/30 [&_input:focus]:bg-white/[0.02] [&_input:focus]:ring-4 [&_input:focus]:ring-white/[0.05] [&_input]:transition-all'

export default function RecuperarPage() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  })

  const onSubmit = async (values: Values) => {
    const supabase = createClient()

    // `next` va explícito: con el flujo PKCE el link vuelve con `code` pero sin
    // `type`, así que sin esto el callback no sabría que es una recuperación y
    // dejaría al usuario en la home, con sesión y sin poder cambiar la clave.
    const redirectTo = `${getPublicSiteUrl()}/auth/callback?next=/auth/update-password`

    const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
      redirectTo,
    })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo enviar el enlace',
        description: error.message,
      })
      return
    }

    // Se confirma siempre igual, exista o no la cuenta: decir "ese correo no
    // está registrado" permitiría enumerar usuarios del Hub.
    setSent(true)
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="absolute -top-[10%] -left-[10%] h-[60vw] max-h-[800px] w-[60vw] max-w-[800px] animate-pulse rounded-full bg-emerald-500/5 blur-[120px]"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute -right-[10%] -bottom-[10%] h-[60vw] max-h-[800px] w-[60vw] max-w-[800px] animate-pulse rounded-full bg-blue-500/5 blur-[120px]"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-7xl items-start justify-center px-4 py-12 sm:items-center sm:py-20 md:py-24">
        <div className="w-full min-w-0 max-w-md">
          <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:mb-10 sm:gap-4">
            <CshDeltaMark
              aria-label="CSH Logo"
              className="h-12 w-12 shrink-0 object-contain text-white"
            />
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/90">
                Computer Science Hub
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                Recuperar acceso
              </p>
            </div>
          </div>

          {sent ? (
            <AuthCard
              title="Revisá tu correo"
              description="Si ese email tiene una cuenta en el Hub, te enviamos un enlace para crear una contraseña nueva."
            >
              <div className="space-y-6 text-center">
                <MailCheck className="mx-auto h-10 w-10 text-emerald-400/80" />
                <p className="text-sm leading-relaxed text-white/50">
                  El enlace llega desde{' '}
                  <span className="text-white/70">noreply@send.cshdevs.org</span> y vence en
                  una hora. Si no lo ves, revisá spam.
                </p>
                <Link
                  href="/login"
                  className="block text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-400/80 transition-colors hover:text-emerald-400"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            </AuthCard>
          ) : (
            <AuthCard
              title="¿Olvidaste tu contraseña?"
              description="Escribí tu correo y te mandamos un enlace para crear una nueva."
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className={fieldStyles}>
                  <InputField
                    label="Correo institucional"
                    id="recuperar-email"
                    type="email"
                    placeholder="alumno@udb.edu.sv"
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register('email')}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-press mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner className="h-4 w-4 bg-black" /> : null}
                  Enviarme el enlace
                </button>

                <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.06] pt-6 text-center">
                  <Link
                    href="/login"
                    className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 transition-colors hover:text-white/70"
                  >
                    Volver a iniciar sesión
                  </Link>
                </div>
              </form>
            </AuthCard>
          )}
        </div>
      </div>
    </main>
  )
}

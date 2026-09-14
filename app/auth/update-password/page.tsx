import Link from 'next/link'

import { createClient } from '@/src/lib/supabase/server'
import { CshDeltaMark } from '@/components/csh-delta-mark'
import { AuthCard } from '@/components/auth-card'

import { UpdatePasswordForm } from './update-password-form'

/**
 * Pantalla final del flujo de recuperación. Se llega acá desde
 * `/auth/callback`, que ya canjeó el link del correo por una sesión.
 *
 * No se protege desde el middleware sino acá: si alguien entra sin sesión, no
 * hay nada que actualizar y se lo manda a pedir un enlace nuevo.
 */
export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const hasSession = Boolean(user && !user.is_anonymous)

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
                Nueva contraseña
              </p>
            </div>
          </div>

          {hasSession ? (
            <UpdatePasswordForm />
          ) : (
            <AuthCard
              title="El enlace no es válido"
              description="Puede haber vencido o haberse usado antes. Pedí uno nuevo para continuar."
            >
              <div className="flex flex-col gap-4 text-center">
                <Link
                  href="/recuperar"
                  className="btn-press flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-transform hover:scale-[1.02]"
                >
                  Pedir un enlace nuevo
                </Link>
                <Link
                  href="/login"
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 transition-colors hover:text-white/70"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            </AuthCard>
          )}
        </div>
      </div>
    </main>
  )
}

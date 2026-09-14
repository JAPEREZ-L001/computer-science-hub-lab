'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { toast } from '@/hooks/use-toast'
import { Spinner } from '@/components/ui/spinner'

import { AuthCard } from '@/components/auth-card'
import { PasswordInput } from '@/components/password-input'
import { createClient } from '@/src/lib/supabase/client'
import { newPasswordSchema } from '@/src/lib/schemas/password'

const schema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

type Values = z.infer<typeof schema>

const fieldStyles =
  '[&_label]:text-[10px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[0.2em] [&_label]:text-white/50 [&_input]:h-12 [&_input]:rounded-2xl [&_input]:border-white/[0.08] [&_input]:bg-black/40 [&_input]:text-sm [&_input]:font-medium [&_input]:text-white [&_input]:placeholder-white/20 [&_input:focus]:border-white/30 [&_input:focus]:bg-white/[0.02] [&_input:focus]:ring-4 [&_input:focus]:ring-white/[0.05] [&_input]:transition-all'

export function UpdatePasswordForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onSubmit',
  })

  const onSubmit = async (values: Values) => {
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo cambiar la contraseña',
        description: error.message,
      })
      return
    }

    toast({
      title: 'Contraseña actualizada',
      description: 'Ya podés usarla para entrar al Hub.',
    })

    router.refresh()
    router.push('/perfil')
  }

  return (
    <AuthCard
      title="Creá tu nueva contraseña"
      description="Elegí una contraseña nueva para tu cuenta del Hub."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className={fieldStyles}>
          <PasswordInput
            label="Nueva contraseña"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            inputProps={{ ...register('password'), autoComplete: 'new-password' }}
          />
        </div>

        <div className={fieldStyles}>
          <PasswordInput
            label="Repetí la contraseña"
            placeholder="Escribila de nuevo"
            error={errors.confirmPassword?.message}
            inputProps={{ ...register('confirmPassword'), autoComplete: 'new-password' }}
          />
        </div>

        <button
          type="submit"
          className="btn-press mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0D0D0D] transition-transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:hover:scale-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner className="h-4 w-4 bg-black" /> : null}
          Guardar contraseña
        </button>
      </form>
    </AuthCard>
  )
}

import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

import { createClient } from '@/src/lib/supabase/server'

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') return null

  return { supabase, user }
}

export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { supabase, user }
}

type ActionFail = { ok: false; message: string }
type ActionOk<T> = { ok: true } & T

export async function assertAdminAction(): Promise<
  ActionFail | ActionOk<{ supabase: Awaited<ReturnType<typeof createClient>>; user: User }>
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { ok: false, message: 'Debes iniciar sesión.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return { ok: false, message: 'No tienes permisos de administrador.' }
  }

  return { ok: true, supabase, user }
}

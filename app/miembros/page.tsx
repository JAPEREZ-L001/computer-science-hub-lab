import { fetchActiveProfiles } from '@/src/lib/supabase/queries'

import { MiembrosDirectory } from '@/components/miembros-directory'

/** Directorio debe reflejar cambios de perfil sin caché obsoleta */
export const dynamic = 'force-dynamic'

export default async function MiembrosPage() {
  const members = await fetchActiveProfiles()

  return <MiembrosDirectory initialMembers={members} />
}

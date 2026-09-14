import { redirect } from 'next/navigation'

import { getAdminSession } from '@/src/lib/supabase/admin-auth'
import { adminListProfiles } from '@/src/lib/supabase/admin-queries'

import { MembersAdminPanel } from '@/components/admin/members-admin-panel'

export default async function AdminMiembrosPage() {
  const session = await getAdminSession()
  if (!session) redirect('/')

  const rows = await adminListProfiles()

  return <MembersAdminPanel initialRows={rows} currentUserId={session.user.id} />
}

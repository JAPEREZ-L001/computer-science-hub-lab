import {
  adminListAssignableMembers,
  adminListCommunityIdeas,
} from '@/src/lib/supabase/admin-queries'

import { IdeasAdminPanel } from '@/components/admin/ideas-admin-panel'

export default async function AdminIdeasPage() {
  const [rows, members] = await Promise.all([
    adminListCommunityIdeas(),
    adminListAssignableMembers(),
  ])

  return <IdeasAdminPanel initialRows={rows} members={members} />
}

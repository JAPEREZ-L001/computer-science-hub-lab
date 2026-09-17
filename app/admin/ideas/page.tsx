import { adminListCommunityIdeas } from '@/src/lib/supabase/admin-queries'

import { IdeasAdminPanel } from '@/components/admin/ideas-admin-panel'

export default async function AdminIdeasPage() {
  const rows = await adminListCommunityIdeas()

  return <IdeasAdminPanel initialRows={rows} />
}

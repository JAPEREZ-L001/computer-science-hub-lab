import { adminListOpportunities } from '@/src/lib/supabase/admin-queries'

import { OpportunitiesAdminPanel } from '@/components/admin/opportunities-admin-panel'

export default async function AdminOportunidadesPage() {
  const rows = await adminListOpportunities()

  return <OpportunitiesAdminPanel initialRows={rows} />
}

import { adminListResources } from '@/src/lib/supabase/admin-queries'

import { ResourcesAdminPanel } from '@/components/admin/resources-admin-panel'

export default async function AdminRecursosPage() {
  const rows = await adminListResources()

  return <ResourcesAdminPanel initialRows={rows} />
}

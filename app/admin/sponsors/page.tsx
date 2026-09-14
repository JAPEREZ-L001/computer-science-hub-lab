import { adminListSponsors } from '@/src/lib/supabase/admin-queries'

import { SponsorsAdminPanel } from '@/components/admin/sponsors-admin-panel'

export default async function AdminSponsorsPage() {
  const rows = await adminListSponsors()

  return <SponsorsAdminPanel initialRows={rows} />
}

import { adminListNews } from '@/src/lib/supabase/admin-queries'

import { NewsAdminPanel } from '@/components/admin/news-admin-panel'

export default async function AdminNoticiasPage() {
  const rows = await adminListNews()

  return <NewsAdminPanel initialRows={rows} />
}

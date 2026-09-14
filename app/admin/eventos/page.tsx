import { adminListEvents } from '@/src/lib/supabase/admin-queries'

import { EventsAdminPanel } from '@/components/admin/events-admin-panel'

export default async function AdminEventosPage() {
  const rows = await adminListEvents()

  return <EventsAdminPanel initialRows={rows} />
}

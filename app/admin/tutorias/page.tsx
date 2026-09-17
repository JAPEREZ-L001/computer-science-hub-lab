import { adminListMentorCandidates, adminListTutoringRequests } from '@/src/lib/supabase/admin-queries'

import { TutoringAdminPanel } from '@/components/admin/tutoring-admin-panel'

export default async function AdminTutoriasPage() {
  const [rows, mentors] = await Promise.all([
    adminListTutoringRequests(),
    adminListMentorCandidates(),
  ])

  return <TutoringAdminPanel initialRows={rows} mentors={mentors} />
}

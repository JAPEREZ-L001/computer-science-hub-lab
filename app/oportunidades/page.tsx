import { fetchPublishedOpportunities } from '@/src/lib/supabase/queries'

import { OportunidadesClient } from '@/components/oportunidades-client'

export default async function OportunidadesPage() {
  const opportunities = await fetchPublishedOpportunities()

  return <OportunidadesClient opportunities={opportunities} />
}

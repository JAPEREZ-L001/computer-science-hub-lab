import { fetchPublishedResources } from '@/src/lib/supabase/queries'

import { RecursosClient } from '@/components/recursos-client'

export default async function RecursosPage() {
  const resources = await fetchPublishedResources()

  return <RecursosClient resources={resources} />
}

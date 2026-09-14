import { createClient } from '@/src/lib/supabase/server'
import { fetchForumChannels, fetchForumMessages } from '@/src/lib/supabase/community-queries'

import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ForumBoard } from '@/components/comunidad/forum-board'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function ForoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams
}) {
  const resolvedSearchParams = await searchParams
  const channelSlug = typeof resolvedSearchParams?.canal === 'string' ? resolvedSearchParams.canal : undefined

  const [channels, supabase] = await Promise.all([fetchForumChannels(), createClient()])
  const selectedChannel = channels.find((c) => c.slug === channelSlug) ?? channels[0]

  const [
    {
      data: { user },
    },
    messagesDesc,
  ] = await Promise.all([
    supabase.auth.getUser(),
    selectedChannel ? fetchForumMessages(selectedChannel.id) : Promise.resolve([]),
  ])

  const authed = Boolean(user && !user.is_anonymous)
  const messages = [...messagesDesc].reverse()

  return (
    <ComunidadShell
      pathname="/comunidad/foro"
      eyebrow="CSH · Foro"
      title="Foro"
      titleAccent="abierto"
      description="Charla en tiempo real con la comunidad del Hub. Cualquiera puede leer; para escribir necesitás una cuenta real."
    >
      {selectedChannel ? (
        <ForumBoard
          channels={channels}
          selectedChannelId={selectedChannel.id}
          initialMessages={messages}
          isAuthenticated={authed}
          currentUserId={user?.id ?? null}
        />
      ) : (
        <p className="text-sm text-white/40">Todavía no hay canales configurados.</p>
      )}
    </ComunidadShell>
  )
}

'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Send } from 'lucide-react'

import { AuthGateModal } from '@/components/auth-gate-modal'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { sendForumMessage } from '@/app/comunidad/actions'
import { getAvatarDataUri } from '@/src/lib/avatar-generator'
import { DISPLAY_NAME_FALLBACK, resolveDisplayName } from '@/src/lib/display-name'
import { FORUM_PAGE_SIZE } from '@/src/lib/forum-constants'
import { createClient } from '@/src/lib/supabase/client'
import type { ForumChannelRow, ForumMessageRow } from '@/src/lib/supabase/community-queries'

type ForumBoardProps = {
  channels: ForumChannelRow[]
  selectedChannelId: string
  /** En orden ascendente (mas viejo primero) -- ya resuelto asi por la page. */
  initialMessages: ForumMessageRow[]
  isAuthenticated: boolean
  currentUserId?: string | null
}

type RealtimeInsertPayload = {
  id: string
  channel_id: string
  author_id: string | null
  content: string
  created_at: string
}

function formatDayLabel(date: Date) {
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return format(date, sameYear ? "d 'de' MMMM" : "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function ForumBoard({
  channels,
  selectedChannelId,
  initialMessages,
  isAuthenticated,
  currentUserId,
}: ForumBoardProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [messages, setMessages] = useState(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialMessages.length >= FORUM_PAGE_SIZE)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const nameCacheRef = useRef<Map<string, string>>(
    new Map(
      initialMessages
        .filter((m): m is ForumMessageRow & { author_id: string; author_name: string } =>
          Boolean(m.author_id && m.author_name),
        )
        .map((m) => [m.author_id, m.author_name]),
    ),
  )
  useEffect(() => {
    setMessages(initialMessages)
    setHasMore(initialMessages.length >= FORUM_PAGE_SIZE)
  }, [selectedChannelId, initialMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [selectedChannelId])

  async function resolveAuthorName(authorId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('full_name').eq('id', authorId).maybeSingle()
    const name = resolveDisplayName({ full_name: data?.full_name ?? null })
    nameCacheRef.current.set(authorId, name)
    setMessages((prev) =>
      prev.map((m) => (m.author_id === authorId && !m.author_name ? { ...m, author_name: name } : m)),
    )
  }

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`forum-messages-${selectedChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_messages',
          filter: `channel_id=eq.${selectedChannelId}`,
        },
        (payload) => {
          const row = payload.new as RealtimeInsertPayload
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [
              ...prev,
              {
                id: row.id,
                channel_id: row.channel_id,
                author_id: row.author_id,
                author_name: row.author_id ? (nameCacheRef.current.get(row.author_id) ?? null) : null,
                content: row.content,
                created_at: row.created_at,
              },
            ]
          })
          if (row.author_id && !nameCacheRef.current.has(row.author_id)) {
            void resolveAuthorName(row.author_id)
          }
          requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [selectedChannelId])

  async function loadMore() {
    if (messages.length === 0 || loadingMore) return
    setLoadingMore(true)
    const oldest = messages[0].created_at
    const supabase = createClient()
    const { data, error } = await supabase
      .from('forum_messages')
      .select('id, channel_id, author_id, content, created_at')
      .eq('channel_id', selectedChannelId)
      .lt('created_at', oldest)
      .order('created_at', { ascending: false })
      .limit(FORUM_PAGE_SIZE)

    if (error || !data || data.length === 0) {
      setLoadingMore(false)
      setHasMore(false)
      return
    }

    const unresolvedIds = [...new Set(data.map((d) => d.author_id).filter((id): id is string => Boolean(id)))].filter(
      (id) => !nameCacheRef.current.has(id),
    )
    if (unresolvedIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', unresolvedIds)
      for (const p of profiles ?? []) {
        nameCacheRef.current.set(p.id as string, resolveDisplayName({ full_name: p.full_name as string | null }))
      }
    }

    const older: ForumMessageRow[] = [...data].reverse().map((d) => ({
      id: d.id as string,
      channel_id: d.channel_id as string,
      author_id: d.author_id as string | null,
      author_name: d.author_id ? (nameCacheRef.current.get(d.author_id as string) ?? DISPLAY_NAME_FALLBACK) : null,
      content: d.content as string,
      created_at: d.created_at as string,
    }))

    setMessages((prev) => [...older, ...prev])
    setHasMore(data.length >= FORUM_PAGE_SIZE)
    setLoadingMore(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    const trimmed = content.trim()
    if (!trimmed) return

    setSending(true)
    const res = await sendForumMessage(selectedChannelId, trimmed)
    setSending(false)

    if (!res.ok) {
      toast({ variant: 'destructive', title: 'No se pudo enviar', description: res.message })
      return
    }
    setContent('')
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
      <AuthGateModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        actionLabel="participar en el foro"
        returnTo="/comunidad/foro"
        title="Registrate para escribir"
        description="Con una cuenta real podés escribir en el foro. Mientras tanto podés leer todos los mensajes."
      />

      {channels.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-white/[0.06] p-3">
          {channels.map((c) => {
            const active = c.id === selectedChannelId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/comunidad/foro?canal=${c.slug}`)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  active
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                #{c.name}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex max-h-[60vh] min-h-[320px] flex-col gap-3 overflow-y-auto p-4">
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="text-xs font-medium text-white/40 transition-colors hover:text-white disabled:opacity-50"
            >
              {loadingMore ? 'Cargando...' : 'Cargar mensajes anteriores'}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <p className="m-auto text-sm text-white/40">Todavía no hay mensajes. Sé el primero en escribir.</p>
        ) : (
          messages.map((m, index) => {
            const isOwn = currentUserId != null && m.author_id === currentUserId
            const name = m.author_id ? (m.author_name ?? DISPLAY_NAME_FALLBACK) : 'Miembro eliminado'

            const profileHref = m.author_id ? (isOwn ? '/perfil' : `/miembros/${m.author_id}`) : null

            const msgDate = new Date(m.created_at)
            const prevDate = index > 0 ? new Date(messages[index - 1].created_at) : null
            const showDayDivider = !prevDate || !isSameDay(msgDate, prevDate)
            const timeLabel = format(msgDate, 'HH:mm')

            return (
              <Fragment key={m.id}>
                {showDayDivider && (
                  <div className="flex items-center justify-center py-1" role="separator" aria-label={formatDayLabel(msgDate)}>
                    <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                      {formatDayLabel(msgDate)}
                    </span>
                  </div>
                )}
                <div className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {m.author_id && profileHref && (
                    <Link href={profileHref} className="mt-0.5 shrink-0" aria-label={`Ver perfil de ${name}`}>
                      <img
                        src={getAvatarDataUri(m.author_id, 32)}
                        alt=""
                        className="h-8 w-8 rounded-full transition-opacity hover:opacity-80"
                      />
                    </Link>
                  )}
                  <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      profileHref ? (
                        <Link href={profileHref} className="mb-1 px-1 text-[11px] font-semibold text-white/50 hover:text-white/80 hover:underline">
                          {name}
                        </Link>
                      ) : (
                        <p className="mb-1 px-1 text-[11px] font-semibold text-white/50">{name}</p>
                      )
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                        isOwn ? 'bg-white text-black' : 'bg-white/[0.05] text-white/90'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-white/25">{timeLabel}</span>
                  </div>
                </div>
              </Fragment>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/[0.06] p-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => {
            if (!isAuthenticated) setAuthModalOpen(true)
          }}
          placeholder={isAuthenticated ? 'Escribí un mensaje...' : 'Iniciá sesión para participar'}
          maxLength={2000}
          readOnly={!isAuthenticated}
          aria-label="Escribir mensaje"
          className="h-10 flex-1 rounded-xl border border-white/[0.08] bg-black/40 px-4 text-sm text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/[0.05]"
        />
        <Button type="submit" size="icon" disabled={sending || (isAuthenticated && !content.trim())} aria-label="Enviar mensaje">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

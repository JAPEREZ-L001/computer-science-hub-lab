import Link from 'next/link'

import { fetchPodcastEpisodes } from '@/src/lib/supabase/community-queries'

import { ComunidadShell } from '@/components/comunidad/comunidad-shell'
import { ExternalLink } from 'lucide-react'

export default async function PodcastPage() {
  const episodes = await fetchPodcastEpisodes()

  return (
    <ComunidadShell
      pathname="/comunidad/podcast"
      eyebrow="CSH-36 · Media"
      title="Podcast"
      titleAccent="y audio del Hub"
      description="Episodios para escuchar en camino al campus o mientras codeás. Pronto podremos enlazar feeds de Spotify o Apple Podcasts."
    >
      {episodes.length === 0 ? (
        <p className="text-sm text-white/45">No hay episodios publicados todavía.</p>
      ) : (
        <ol className="space-y-4">
          {episodes.map((ep, i) => (
            <li
              key={ep.id}
              className="flex flex-col gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="text-xs text-white/35">Ep. {String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-1 font-semibold text-white">{ep.title}</h3>
                {ep.summary ? <p className="mt-2 text-sm text-white/45">{ep.summary}</p> : null}
                <p className="mt-2 text-xs text-white/30">
                  {ep.platform}
                  {ep.published_at
                    ? ` · ${new Date(ep.published_at).toLocaleDateString('es-SV')}`
                    : ''}
                </p>
              </div>
              <Link
                href={ep.episode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white"
              >
                Escuchar
                <ExternalLink className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </ComunidadShell>
  )
}

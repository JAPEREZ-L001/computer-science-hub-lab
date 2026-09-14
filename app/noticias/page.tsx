import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Newspaper, BellRing, Trophy, Calendar, RefreshCcw, ArrowRight } from 'lucide-react'

import { fetchPublishedNews } from '@/src/lib/supabase/queries'
import type { NewsCategory } from '@/src/types'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

function formatDateEs(date: string) {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es })
}

function categoryLabel(category: NewsCategory) {
  switch (category) {
    case 'anuncio': return 'Anuncio'
    case 'logro': return 'Logro'
    case 'evento': return 'Evento'
    case 'update': return 'Update'
  }
}

function categoryBadgeClass(category: NewsCategory) {
  switch (category) {
    case 'anuncio': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    case 'logro': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'evento': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
    case 'update': return 'bg-white/5 text-white/50 border border-white/10'
  }
}

function categoryIcon(category: NewsCategory) {
  switch (category) {
    case 'anuncio': return <BellRing className="h-3 w-3" />
    case 'logro': return <Trophy className="h-3 w-3" />
    case 'evento': return <Calendar className="h-3 w-3" />
    case 'update': return <RefreshCcw className="h-3 w-3" />
  }
}

function excerpt120(text: string) {
  if (text.length <= 120) return text
  return `${text.slice(0, 117)}...`
}

export default async function NoticiasPage() {
  const sortedNews = await fetchPublishedNews()

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden pt-10">
      <Header />
      
      <section className="relative pt-24 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="mb-6 inline-block text-[11px] font-bold uppercase tracking-[0.4em] text-white/40">
              Noticias del Hub
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Novedades <span className="text-white/40">recientes</span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/50">
              Mantente al tanto de nuestros anuncios oficiales, logros de la comunidad y actualizaciones importantes sobre los programas y proyectos.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6">
        {sortedNews.length === 0 ? (
          <div className="mb-20">
            <Empty className="border-white/[0.06] bg-white/[0.01]">
              <EmptyHeader>
                <EmptyTitle className="text-white">No hay noticias publicadas</EmptyTitle>
                <EmptyContent className="text-white/50">
                  Aún no hay anuncios. Vuelve pronto para enterarte de lo que pasa en la comunidad.
                </EmptyContent>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedNews.map((post) => (
              <Link key={post.id} href={`/noticias/${post.slug}`} className="group block">
                <div className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-white/[0.04]">
                  <div>
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${categoryBadgeClass(post.category)}`}>
                        {categoryIcon(post.category)}
                        {categoryLabel(post.category)}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-widest text-white/30 text-right">
                        {formatDateEs(post.date)}
                      </span>
                    </div>

                    <h2 className="mb-4 text-xl font-bold text-white transition-colors group-hover:text-white/90">
                      {post.title}
                    </h2>

                    <p className="text-sm leading-relaxed text-white/50 group-hover:text-white/60">
                      {excerpt120(post.excerpt)}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                      Por {post.author}
                    </p>
                    <ArrowRight className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:text-white/70 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>

      <Footer />
    </main>
  )
}

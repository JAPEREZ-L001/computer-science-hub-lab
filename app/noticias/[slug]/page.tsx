import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReactNode } from 'react'

import { PageBreadcrumb } from '@/components/page-breadcrumb'

import { fetchNewsBySlug } from '@/src/lib/supabase/queries'
import type { NewsCategory } from '@/src/types'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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

/**
 * Sanitise text content coming from database Markdown to prevent
 * HTML injection. React JSX auto‑escapes string children, but this
 * function provides defence‑in‑depth by stripping any embedded HTML
 * tags *before* they reach the render tree.
 */
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

function renderBasicMarkdown(content: string): ReactNode[] {
  const lines = content.split(/\r?\n/)
  const nodes: ReactNode[] = []
  let listBuffer: { kind: 'ul' | 'ol'; items: string[] } | null = null

  const flushList = () => {
    if (!listBuffer) return
    if (listBuffer.kind === 'ul') {
      nodes.push(
        <ul key={`ul-${nodes.length}`} className="my-6 ml-6 list-disc space-y-2 text-white/70">
          {listBuffer.items.map((it, idx) => (
            <li key={`${idx}`} className="leading-relaxed">{stripHtmlTags(it)}</li>
          ))}
        </ul>,
      )
    } else {
      nodes.push(
        <ol key={`ol-${nodes.length}`} className="my-6 ml-6 list-decimal space-y-2 text-white/70">
          {listBuffer.items.map((it, idx) => (
            <li key={`${idx}`} className="leading-relaxed">{stripHtmlTags(it)}</li>
          ))}
        </ol>,
      )
    }
    listBuffer = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushList()
      nodes.push(
        <h2 key={`h2-${nodes.length}`} className="mt-12 mb-6 text-2xl font-bold tracking-tight text-white border-b border-white/[0.06] pb-4">
          {stripHtmlTags(trimmed.slice(3))}
        </h2>,
      )
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      nodes.push(
        <h3 key={`h3-${nodes.length}`} className="mt-8 mb-4 text-xl font-bold text-white/90">
          {stripHtmlTags(trimmed.slice(4))}
        </h3>,
      )
      continue
    }

    if (trimmed.startsWith('- ')) {
      const item = trimmed.slice(2)
      if (!listBuffer || listBuffer.kind !== 'ul') {
        flushList()
        listBuffer = { kind: 'ul', items: [item] }
      } else {
        listBuffer.items.push(item)
      }
      continue
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numberedMatch) {
      const item = numberedMatch[2]
      if (!listBuffer || listBuffer.kind !== 'ol') {
        flushList()
        listBuffer = { kind: 'ol', items: [item] }
      } else {
        listBuffer.items.push(item)
      }
      continue
    }

    flushList()
    nodes.push(
      <p key={`p-${nodes.length}`} className="mb-6 leading-loose text-white/60">
        {stripHtmlTags(trimmed)}
      </p>,
    )
  }

  flushList()
  return nodes
}

export default async function NoticiaSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await fetchNewsBySlug(slug)

  if (!post) {
    redirect('/noticias')
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden pt-10">
      <Header />
      
      <div className="mx-auto max-w-3xl px-4 pt-24 pb-32 sm:px-6">
        
        <div className="mb-12">
          <PageBreadcrumb
            pathname="/noticias"
            finalLabel={post.title}
          />
        </div>

        <article>
          <header className="space-y-8 border-b border-white/[0.06] pb-12">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${categoryBadgeClass(post.category)}`}>
                {categoryLabel(post.category)}
               </span>
               <span className="text-xs font-medium text-white/40">
                 {formatDateEs(post.date)}
               </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl text-white text-balance">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                 {post.author.charAt(0)}
               </div>
               <div>
                  <p className="text-sm font-semibold text-white/80">{post.author}</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Hub Team</p>
               </div>
            </div>
          </header>

          <div className="border-transparent">
            {post.excerpt && (
              <p className="my-10 text-lg leading-relaxed font-medium text-white/60 border-l-2 border-white/20 pl-6">
                {post.excerpt}
              </p>
            )}

            <div className="prose prose-invert max-w-none pt-4">
              {renderBasicMarkdown(post.content)}
            </div>
          </div>
        </article>
      </div>

      <Footer />
    </main>
  )
}

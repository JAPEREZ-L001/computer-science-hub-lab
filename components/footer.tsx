import Link from "next/link"
import { Github, Linkedin } from "lucide-react"
import { CshDeltaMark } from "@/components/csh-delta-mark"

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Link href="/" className="flex shrink-0 items-center justify-center rounded-2xl bg-white/5 p-3 border border-white/10 transition-colors hover:bg-white/10">
              <CshDeltaMark
                aria-label="CSH Logo"
                className="h-8 w-8 shrink-0 object-contain text-white"
              />
            </Link>
            <div>
              <p className="font-bold tracking-[0.25em] text-[11px] uppercase text-white/90">Computer Science Hub</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                La disrupción provoca innovación <span className="mx-1 opacity-50">·</span> Ingeniería que impulsa el futuro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/15"
              aria-label="GitHub (próximamente)"
              title="Próximamente"
            >
              <Github className="h-4 w-4" />
            </span>
            <span
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/15"
              aria-label="X, antes Twitter (próximamente)"
              title="Próximamente"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </span>
            <span
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-white/15"
              aria-label="LinkedIn (próximamente)"
              title="Próximamente"
            >
              <Linkedin className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/[0.06] pt-8 md:flex-row md:items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <a
              href="https://phaser.io/agent/play/RVP3JP2og6z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline"
            >
              ©
            </a>{" "}
            {new Date().getFullYear()} Computer Science Hub. All rights reserved.
          </p>
          <nav
            aria-label="Enlaces legales y de contacto"
            className="flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-3 sm:gap-x-6 md:w-auto md:justify-end md:gap-x-8 md:gap-y-0"
          >
            <Link
              href="/privacidad"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
            >
              Términos
            </Link>
            <Link
              href="/feedback"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80 transition-colors hover:text-emerald-400"
            >
              Déjanos tu opinión
            </Link>
            <Link
              href="/encuesta-betatester"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400/80 transition-colors hover:text-sky-400"
            >
              Encuesta betatester
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

function useIsAndroid() {
  const [isAndroid, setIsAndroid] = useState(false)
  useEffect(() => {
    setIsAndroid(typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent))
  }, [])
  return isAndroid
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export function HeroSection() {
  const isAndroid = useIsAndroid()
  const isMobile = useIsMobile()
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-24 pb-20 px-4 sm:px-0 bg-[#050505]">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); opacity: 0; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; opacity: 0.9; filter: drop-shadow(0 0 10px rgba(255,255,255,0.1)); }
          50% { filter: drop-shadow(0 0 25px rgba(255,255,255,0.4)); opacity: 1; }
          100% { background-position: -200% 50%; opacity: 0.9; filter: drop-shadow(0 0 10px rgba(255,255,255,0.1)); }
        }
        .hero-gradient-text {
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          background-image: linear-gradient(to right, #d1fae5, #ffffff, #d1fae5);
          background-size: 200% auto;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: background-position;
        }
        @supports not (background-clip: text) {
          .hero-gradient-text {
            -webkit-text-fill-color: #d1fae5;
            color: #d1fae5;
            background: none !important;
            background-image: none !important;
          }
        }
      `}} />

      {/* Hero background image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full" style={{ animation: 'subtle-zoom 3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero.png-MxyJ3FP4CbYnPmcUTCJ0Q7uI8dNd2M.jpeg"
            alt="CSH Headquarters"
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        {/* Radial vignette mask (heavy sides, clearer center) - Using inline style for max compatibility */}
        <div 
          className="absolute inset-0 opacity-90"
          style={{ background: "radial-gradient(circle at center, transparent 0%, #050505 100%)" }}
        />
        {/* Bottom linear fade so it blends seamlessly to the standard dark background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-6 text-center mt-8">
        {/* Premium Pill Badge */}
        <div className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.02)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            La disrupción provoca innovación
          </span>
        </div>

        <h1 className="mb-8">
          <span className="block text-4xl font-bold tracking-[0.1em] sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl text-white pb-1">
            COMPUTER
          </span>
          {isMobile ? (
            <span className="block text-4xl font-bold tracking-[0.1em] sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl pb-1 text-white">
              SCIENCE HUB
            </span>
          ) : isAndroid ? (
            <span className="block text-4xl font-bold tracking-[0.1em] sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl pb-1 [filter:drop-shadow(0_0_15px_rgba(255,255,255,0.2))]">
              <svg
                viewBox="0 0 420 60"
                className="inline-block h-[1.15em] w-full max-w-[420px]"
                style={{ minHeight: '1.15em' }}
                aria-hidden
              >
                <defs>
                  <linearGradient id="hero-shimmer-android" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d1fae5" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#d1fae5" />
                  </linearGradient>
                </defs>
                <text
                  x="50%"
                  y="45"
                  textAnchor="middle"
                  fill="url(#hero-shimmer-android)"
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '48px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  SCIENCE HUB
                </text>
              </svg>
            </span>
          ) : (
            <span
              className="hero-gradient-text block text-4xl font-bold tracking-[0.1em] sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl pb-1"
              style={{
                animation: 'text-shimmer 6s linear infinite',
                WebkitBackfaceVisibility: 'hidden' as const,
                backfaceVisibility: 'hidden',
              }}
            >
              SCIENCE HUB
            </span>
          )}
        </h1>

        <p className="mx-auto mb-14 max-w-xl text-sm sm:text-base font-medium leading-relaxed text-white/50">
          Comunidad estudiantil de Ciencias de la Computación que convierte el aula en
          un laboratorio vivo de aprendizaje, organización y proyección profesional:
          acompañamiento académico entre pares y puente vital hacia la industria tecnológica global.
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link
            href="/nosotros"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.03] px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 transition-all duration-300 hover:border-white/40 hover:bg-white/[0.08] hover:text-white backdrop-blur-sm"
          >
            Explorar ecosistema
          </Link>
        </div>
      </div>
    </section>
  )
}

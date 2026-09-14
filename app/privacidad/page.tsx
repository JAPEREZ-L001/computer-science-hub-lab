import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <Header />
      <div className="overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            Política de Privacidad
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-16">
            Última actualización: {new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8">
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">1. Información que recopilamos</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Computer Science Hub recopila la información que proporcionás al registrarte: nombre, correo electrónico, carrera, ciclo y área de interés. Esta información se usa para gestionar tu cuenta, conectarte con programas y eventos, y mejorar la experiencia en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">2. Uso de la información</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Utilizamos tus datos para crear y administrar tu perfil, enviarte notificaciones sobre eventos e inscripciones, y comunicarte novedades relevantes del Hub. No vendemos ni compartimos tu información con terceros con fines comerciales.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">3. Seguridad y retención</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Implementamos medidas técnicas y organizativas para proteger tus datos. Conservamos la información mientras tu cuenta esté activa o según lo requieran obligaciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">4. Tus derechos</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Podés acceder, rectificar o solicitar la eliminación de tus datos personales. Para ejercer estos derechos o plantear consultas, contactanos a través del formulario de feedback o los canales oficiales del Hub.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">5. Contacto</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Para preguntas sobre esta política: Universidad Don Bosco, Antiguo Cuscatlán, El Salvador. También podés usar el formulario de <Link href="/feedback" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">feedback</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

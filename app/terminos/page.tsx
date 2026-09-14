import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TerminosPage() {
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
            Términos y Condiciones
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-16">
            Última actualización: {new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8">
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">1. Aceptación de los términos</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Al acceder y utilizar Computer Science Hub (CSH) aceptás estos términos y condiciones. Si no estás de acuerdo, no utilices la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">2. Descripción del servicio</h2>
              <p className="text-sm leading-relaxed text-white/70">
                CSH es una plataforma de la Universidad Don Bosco que conecta estudiantes y profesionales en tecnología. Ofrecemos acceso a eventos, recursos, comunidad, mentorías y oportunidades, sujeto a disponibilidad y reglas internas del Hub.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">3. Uso aceptable</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Te comprometés a usar la plataforma de forma responsable, sin difundir contenido ofensivo, spam o información falsa. El incumplimiento puede resultar en la suspensión o eliminación de tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">4. Cuenta y datos</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Sos responsable de mantener la confidencialidad de tu cuenta. La información que proporcionás se rige por nuestra <Link href="/privacidad" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Política de Privacidad</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">5. Modificaciones</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Nos reservamos el derecho de modificar estos términos. Los cambios se comunicarán a través de la plataforma o canales oficiales. El uso continuado tras las modificaciones implica la aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">6. Contacto</h2>
              <p className="text-sm leading-relaxed text-white/70">
                Para consultas sobre estos términos: Universidad Don Bosco, Antiguo Cuscatlán, El Salvador. Podés usar el formulario de <Link href="/feedback" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">feedback</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

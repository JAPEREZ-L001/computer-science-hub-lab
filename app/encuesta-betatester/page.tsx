import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { BetatesterSurveyForm } from '@/components/betatester-survey-form'

export default function BetatesterSurveyPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0D0D0D] text-white">
      <Header />
      <div className="mx-auto w-full min-w-0 max-w-3xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          Encuesta Betatester
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-white/60">
          Esta encuesta es para la beta cerrada de CSH. Selecciona tu tipo de participante y
          responde solo tu sección correspondiente. Al final, todos completan el bloque común de
          valor.
        </p>

        <div className="mt-8 min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:mt-10 sm:p-6 md:p-8">
          <BetatesterSurveyForm />
        </div>
      </div>
      <Footer />
    </main>
  )
}

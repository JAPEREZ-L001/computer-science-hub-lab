import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FeedbackForm } from '@/components/feedback-form'

export default function FeedbackPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0D0D0D] text-white">
      <Header />
      <div className="mx-auto w-full min-w-0 max-w-2xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 sm:pb-24">
        <h1 className="mb-4 text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          Déjanos tu opinión
        </h1>
        <p className="mb-8 max-w-xl text-pretty text-sm leading-relaxed text-white/60 sm:mb-12">
          Tu feedback nos ayuda a mejorar la experiencia de Computer Science Hub. Contanos qué te gustaría ver, qué mejorar o cualquier sugerencia.
        </p>

        <FeedbackForm />
      </div>
      <Footer />
    </main>
  )
}

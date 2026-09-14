import { Briefcase, Calendar, BookOpen } from "lucide-react"
import { PhilosophySection } from "@/components/philosophy-section"
import { EcosystemSection } from "@/components/ecosystem-section"
import { ValuesSection } from "@/components/values-section"
import { SponsorsSection } from "@/components/sponsors-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContextualSuggestion } from "@/components/contextual-suggestion"
import { MicroIntakeForm } from "@/components/micro-intake-form"
import { NosotrosHero, QuienesSomos, ProgramasSection } from "@/components/nosotros-sections"

export default async function NosotrosPage() {
  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <Header />
      <div className="overflow-x-hidden responsive-safe">
        <NosotrosHero />
        <QuienesSomos />
        <PhilosophySection />
        <EcosystemSection />
        <ValuesSection />
        <ProgramasSection />
        <SponsorsSection />
        <MicroIntakeForm variant="programas" />



        <ContextualSuggestion
          theme="dark"
          suggestions={[
            { title: "Recursos y Oportunidades", description: "Contenido exclusivo para miembros. Próximamente.", href: "#", icon: BookOpen, requiresAuth: true },
            { title: "Próximos eventos", description: "Charlas, talleres y hackathons.", href: "/eventos", icon: Calendar, requiresAuth: true },
          ]}
        />

        <Footer />
      </div>
    </main>
  )
}

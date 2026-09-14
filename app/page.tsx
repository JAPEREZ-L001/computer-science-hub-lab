import { HeroSection } from "@/components/hero-section"
import { SitePath } from "@/components/site-path"
import { SponsorsSection } from "@/components/sponsors-section"
import { HomeGrowthSections } from "@/components/home-growth-sections"
import { InteractiveFeaturesSection } from "@/components/interactive-features-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="overflow-x-hidden">
        <HeroSection />
        <InteractiveFeaturesSection />
        <SitePath />
        <HomeGrowthSections />
        <SponsorsSection />
        <Footer />
      </div>
    </main>
  )
}

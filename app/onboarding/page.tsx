import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { fetchProfileByUserId } from "@/src/lib/supabase/queries"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OnboardingWizard } from "./onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await fetchProfileByUserId(user.id)
  
  // If already completed, don't let them do it again
  if (profile && profile.onboardingCompleted) {
    redirect("/perfil")
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-32 sm:py-40">
        <OnboardingWizard profile={profile ?? null} />
      </div>
      <Footer />
    </main>
  )
}

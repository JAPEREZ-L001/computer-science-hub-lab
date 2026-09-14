"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/src/lib/supabase/server"
import { sanitizeOptionalUrl } from "@/src/lib/url-validation"
import type { UniversityCode, UniversityRole } from "@/src/types"

const VALID_UNIVERSITY_ROLES: UniversityRole[] = ['estudiante', 'catedratico']
const VALID_UNIVERSITIES: UniversityCode[] = ['UDB', 'UCA', 'UES', 'UFG', 'UEES', 'ESEN']

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autorizado" }
  }

  const bio            = (formData.get("bio")      as string)?.trim() || null
  const github         = sanitizeOptionalUrl((formData.get("github")   as string) ?? "")
  const linkedin       = sanitizeOptionalUrl((formData.get("linkedin") as string) ?? "")
  const universityRole = formData.get("universityRole") as UniversityRole | null
  const university     = formData.get("university")     as UniversityCode | null

  // Validar campos controlados
  const safeUniversityRole: UniversityRole =
    universityRole && VALID_UNIVERSITY_ROLES.includes(universityRole)
      ? universityRole
      : 'estudiante'

  const safeUniversity: UniversityCode =
    university && VALID_UNIVERSITIES.includes(university)
      ? university
      : 'UDB'

  // 1. Fetch del perfil actual
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("onboarding_completed, reputation_score")
    .eq("id", user.id)
    .single()

  if (profileErr || !profile) {
    return { error: "Perfil no encontrado" }
  }

  // 2. Evitar doble award de puntos
  if (profile.onboarding_completed) {
    return { error: "El onboarding ya fue completado previamente." }
  }

  // 3. Actualizar perfil
  const reputation = (profile.reputation_score || 0) + 5

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      bio,
      github_url:       github,
      linkedin_url:     linkedin,
      university_role:  safeUniversityRole,
      university:       safeUniversity,
      onboarding_completed: true,
      reputation_score: reputation,
    })
    .eq("id", user.id)

  if (updateErr) {
    return { error: "Error al actualizar perfil: " + updateErr.message }
  }

  revalidatePath("/perfil")
  return { success: true }
}

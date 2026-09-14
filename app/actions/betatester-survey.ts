'use server'

import { headers } from 'next/headers'

import { createClient } from '@/src/lib/supabase/server'
import { checkRateLimit } from '@/src/lib/rate-limiter'
import {
  newSurveySchema,
  returningSurveySchema,
  type NewSurveyInput,
  type ReturningSurveyInput,
} from '@/src/lib/schemas/betatester-survey'

const ANON_SURVEY_RATE_LIMIT = 75 // máximo de encuestas por hora para usuarios anónimos

export async function submitNewUserSurvey(input: NewSurveyInput) {
  const parsed = newSurveySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, message: 'Revisá los campos obligatorios de la encuesta.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rate limiting para usuarios anónimos
  const isAnonymous = !user || user.is_anonymous
  if (isAnonymous) {
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'
    const rl = checkRateLimit(`survey_new:${ip}`, ANON_SURVEY_RATE_LIMIT)
    if (!rl.allowed) {
      return { ok: false as const, message: 'Demasiados envíos. Intentá de nuevo en un momento.' }
    }
  }

  const payload = {
    user_id: user?.is_anonymous ? null : user?.id ?? null,
    role: parsed.data.role,
    role_other: parsed.data.roleOther ?? null,
    device: parsed.data.device,
    familiarity: parsed.data.familiarity,
    home_offer_summary: parsed.data.homeOfferSummary,
    home_value_clarity: parsed.data.homeValueClarity,
    home_next_step_clarity: parsed.data.homeNextStepClarity,
    home_next_action: parsed.data.homeNextAction,
    suggested_path_score: parsed.data.suggestedPathScore,
    suggested_path_improve: parsed.data.suggestedPathImprove ?? null,
    first_public_route: parsed.data.firstPublicRoute,
    route_utility_score: parsed.data.routeUtilityScore,
    route_trust_score: parsed.data.routeTrustScore,
    missing_trust: parsed.data.missingTrust ?? null,
    register_probability: parsed.data.registerProbability,
    register_barrier: parsed.data.registerBarrier,
    register_motivator: parsed.data.registerMotivator,
    top_new_user_improvement: parsed.data.topNewUserImprovement,
    common_value_clarity: parsed.data.commonValueClarity,
    common_site_utility: parsed.data.commonSiteUtility,
    common_recommend_probability: parsed.data.commonRecommendProbability,
    common_most_valuable_module: parsed.data.commonMostValuableModule,
    common_priority_improvement: parsed.data.commonPriorityImprovement,
    cohort_tag: 'beta-cerrada',
  }

  const { error } = await supabase.from('betatester_survey_new_users').insert(payload)
  if (error) {
    console.error('submitNewUserSurvey', error)
    return { ok: false as const, message: 'No se pudo guardar tu encuesta. Intentá nuevamente.' }
  }

  return { ok: true as const }
}

export async function submitReturningUserSurvey(input: ReturningSurveyInput) {
  const parsed = returningSurveySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false as const, message: 'Revisá los campos obligatorios de la encuesta.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rate limiting para usuarios anónimos (paridad con submitNewUserSurvey)
  const isAnonymous = !user || user.is_anonymous
  if (isAnonymous) {
    const headersList = await headers()
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'
    const rl = checkRateLimit(`survey_returning:${ip}`, ANON_SURVEY_RATE_LIMIT)
    if (!rl.allowed) {
      return { ok: false as const, message: 'Demasiados envíos. Intentá de nuevo en un momento.' }
    }
  }

  const payload = {
    user_id: user?.is_anonymous ? null : user?.id ?? null,
    overall_compared_to_previous: parsed.data.overallComparedToPrevious,
    most_improved_area: parsed.data.mostImprovedArea,
    pending_aspect: parsed.data.pendingAspect,
    tested_login_register: parsed.data.testedLoginRegister,
    login_ease: parsed.data.loginEase ?? null,
    login_outcome: parsed.data.loginOutcome ?? null,
    tested_onboarding: parsed.data.testedOnboarding,
    onboarding_progress_clarity: parsed.data.onboardingProgressClarity ?? null,
    onboarding_main_friction: parsed.data.onboardingMainFriction ?? null,
    used_community_hub: parsed.data.usedCommunityHub,
    main_community_module: parsed.data.mainCommunityModule ?? null,
    completed_community_action: parsed.data.completedCommunityAction ?? null,
    community_next_step_clarity: parsed.data.communityNextStepClarity ?? null,
    main_community_blocker: parsed.data.mainCommunityBlocker ?? null,
    visited_content_routes: parsed.data.visitedContentRoutes,
    return_most_motivating_route: parsed.data.returnMostMotivatingRoute,
    completed_value_action: parsed.data.completedValueAction,
    weekly_return_probability: parsed.data.weeklyReturnProbability,
    top_three_sprint_improvements: parsed.data.topThreeSprintImprovements,
    po_first_change: parsed.data.poFirstChange,
    common_value_clarity: parsed.data.commonValueClarity,
    common_site_utility: parsed.data.commonSiteUtility,
    common_recommend_probability: parsed.data.commonRecommendProbability,
    common_most_valuable_module: parsed.data.commonMostValuableModule,
    common_priority_improvement: parsed.data.commonPriorityImprovement,
    cohort_tag: 'beta-cerrada',
  }

  const { error } = await supabase.from('betatester_survey_returning_users').insert(payload)
  if (error) {
    console.error('submitReturningUserSurvey', error)
    return { ok: false as const, message: 'No se pudo guardar tu encuesta. Intentá nuevamente.' }
  }

  return { ok: true as const }
}

import { describe, expect, it } from 'vitest'
import { newSurveySchema, returningSurveySchema } from './betatester-survey'

const validNewSurvey = {
  role: 'estudiante_computacion',
  device: 'laptop_desktop',
  familiarity: 'conocimiento_general',
  homeOfferSummary: 'Comunidad de estudiantes de computación',
  homeValueClarity: 4,
  homeNextStepClarity: 4,
  homeNextAction: 'registrarme_login',
  suggestedPathScore: 5,
  firstPublicRoute: 'eventos',
  routeUtilityScore: 4,
  routeTrustScore: 5,
  registerProbability: 4,
  registerBarrier: 'no_tengo_tiempo',
  registerMotivator: 'tutorias',
  topNewUserImprovement: 'Más claridad en el home',
  commonValueClarity: 4,
  commonSiteUtility: 4,
  commonRecommendProbability: 5,
  commonMostValuableModule: 'Eventos',
  commonPriorityImprovement: 'Mejorar el onboarding',
}

const validReturningSurvey = {
  overallComparedToPrevious: 'mejor',
  mostImprovedArea: 'navegacion',
  pendingAspect: 'Falta mejorar el onboarding',
  testedLoginRegister: true,
  testedOnboarding: true,
  usedCommunityHub: true,
  visitedContentRoutes: ['eventos', 'recursos'],
  returnMostMotivatingRoute: 'eventos',
  completedValueAction: 'si',
  weeklyReturnProbability: 4,
  topThreeSprintImprovements: ['simplificar_home', 'mejorar_onboarding'],
  poFirstChange: 'Simplificar el flujo de registro',
  commonValueClarity: 4,
  commonSiteUtility: 4,
  commonRecommendProbability: 5,
  commonMostValuableModule: 'Comunidad',
  commonPriorityImprovement: 'Mejorar el onboarding',
}

describe('newSurveySchema', () => {
  it('accepts a fully valid payload', () => {
    const result = newSurveySchema.safeParse(validNewSurvey)
    expect(result.success).toBe(true)
  })

  it('rejects a missing required field', () => {
    const { role: _role, ...withoutRole } = validNewSurvey
    const result = newSurveySchema.safeParse(withoutRole)
    expect(result.success).toBe(false)
  })

  it('rejects an invalid enum value', () => {
    const result = newSurveySchema.safeParse({ ...validNewSurvey, device: 'smartwatch' })
    expect(result.success).toBe(false)
  })

  it('rejects a score outside the 1-5 range', () => {
    const result = newSurveySchema.safeParse({ ...validNewSurvey, homeValueClarity: 6 })
    expect(result.success).toBe(false)
  })

  it('rejects a non-integer score', () => {
    const result = newSurveySchema.safeParse({ ...validNewSurvey, homeValueClarity: 3.5 })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from free-text fields', () => {
    const result = newSurveySchema.safeParse({
      ...validNewSurvey,
      topNewUserImprovement: '  con espacios  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.topNewUserImprovement).toBe('con espacios')
    }
  })
})

describe('returningSurveySchema', () => {
  it('accepts a fully valid payload', () => {
    const result = returningSurveySchema.safeParse(validReturningSurvey)
    expect(result.success).toBe(true)
  })

  it('rejects an empty visitedContentRoutes array', () => {
    const result = returningSurveySchema.safeParse({ ...validReturningSurvey, visitedContentRoutes: [] })
    expect(result.success).toBe(false)
  })

  it('rejects more than 3 topThreeSprintImprovements', () => {
    const result = returningSurveySchema.safeParse({
      ...validReturningSurvey,
      topThreeSprintImprovements: [
        'simplificar_home',
        'mejorar_onboarding',
        'mejorar_perfil_hub',
        'mas_actividad_comunidad',
      ],
    })
    expect(result.success).toBe(false)
  })

  it('allows optional fields to be omitted', () => {
    const result = returningSurveySchema.safeParse(validReturningSurvey)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.loginEase).toBeUndefined()
      expect(result.data.mainCommunityModule).toBeUndefined()
    }
  })

  it('rejects an invalid boolean-typed field', () => {
    const result = returningSurveySchema.safeParse({ ...validReturningSurvey, testedLoginRegister: 'yes' })
    expect(result.success).toBe(false)
  })
})

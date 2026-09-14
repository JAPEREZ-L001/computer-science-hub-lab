-- Encuestas betatester v1 (beta cerrada)
-- Dos tablas separadas con columnas explícitas + bloque común comparable.

CREATE TABLE IF NOT EXISTS public.betatester_survey_new_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  cohort_tag text NOT NULL DEFAULT 'beta-cerrada',

  role text NOT NULL,
  role_other text NULL,
  device text NOT NULL,
  familiarity text NOT NULL,

  home_offer_summary text NOT NULL,
  home_value_clarity smallint NOT NULL CHECK (home_value_clarity BETWEEN 1 AND 5),
  home_next_step_clarity smallint NOT NULL CHECK (home_next_step_clarity BETWEEN 1 AND 5),
  home_next_action text NOT NULL,
  suggested_path_score smallint NOT NULL CHECK (suggested_path_score BETWEEN 1 AND 5),
  suggested_path_improve text NULL,

  first_public_route text NOT NULL,
  route_utility_score smallint NOT NULL CHECK (route_utility_score BETWEEN 1 AND 5),
  route_trust_score smallint NOT NULL CHECK (route_trust_score BETWEEN 1 AND 5),
  missing_trust text NULL,

  register_probability smallint NOT NULL CHECK (register_probability BETWEEN 1 AND 5),
  register_barrier text NOT NULL,
  register_motivator text NOT NULL,
  top_new_user_improvement text NOT NULL,

  common_value_clarity smallint NOT NULL CHECK (common_value_clarity BETWEEN 1 AND 5),
  common_site_utility smallint NOT NULL CHECK (common_site_utility BETWEEN 1 AND 5),
  common_recommend_probability smallint NOT NULL CHECK (common_recommend_probability BETWEEN 1 AND 5),
  common_most_valuable_module text NOT NULL,
  common_priority_improvement text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.betatester_survey_returning_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  cohort_tag text NOT NULL DEFAULT 'beta-cerrada',

  overall_compared_to_previous text NOT NULL,
  most_improved_area text NOT NULL,
  pending_aspect text NOT NULL,

  tested_login_register boolean NOT NULL DEFAULT false,
  login_ease smallint NULL CHECK (login_ease BETWEEN 1 AND 5),
  login_outcome text NULL,
  tested_onboarding boolean NOT NULL DEFAULT false,
  onboarding_progress_clarity smallint NULL CHECK (onboarding_progress_clarity BETWEEN 1 AND 5),
  onboarding_main_friction text NULL,

  used_community_hub boolean NOT NULL DEFAULT false,
  main_community_module text NULL,
  completed_community_action text NULL,
  community_next_step_clarity smallint NULL CHECK (community_next_step_clarity BETWEEN 1 AND 5),
  main_community_blocker text NULL,

  visited_content_routes text[] NOT NULL DEFAULT '{}',
  return_most_motivating_route text NOT NULL,
  completed_value_action text NOT NULL,
  weekly_return_probability smallint NOT NULL CHECK (weekly_return_probability BETWEEN 1 AND 5),
  top_three_sprint_improvements text[] NOT NULL DEFAULT '{}',
  po_first_change text NOT NULL,

  common_value_clarity smallint NOT NULL CHECK (common_value_clarity BETWEEN 1 AND 5),
  common_site_utility smallint NOT NULL CHECK (common_site_utility BETWEEN 1 AND 5),
  common_recommend_probability smallint NOT NULL CHECK (common_recommend_probability BETWEEN 1 AND 5),
  common_most_valuable_module text NOT NULL,
  common_priority_improvement text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_betatester_new_created_at
  ON public.betatester_survey_new_users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_betatester_new_role
  ON public.betatester_survey_new_users(role);

CREATE INDEX IF NOT EXISTS idx_betatester_new_device
  ON public.betatester_survey_new_users(device);

CREATE INDEX IF NOT EXISTS idx_betatester_returning_created_at
  ON public.betatester_survey_returning_users(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_betatester_returning_weekly_return
  ON public.betatester_survey_returning_users(weekly_return_probability);

ALTER TABLE public.betatester_survey_new_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betatester_survey_returning_users ENABLE ROW LEVEL SECURITY;

-- Limpieza idempotente de políticas
DROP POLICY IF EXISTS "betatester_new_select_admin" ON public.betatester_survey_new_users;
DROP POLICY IF EXISTS "betatester_new_insert_open_beta" ON public.betatester_survey_new_users;
DROP POLICY IF EXISTS "betatester_returning_select_admin" ON public.betatester_survey_returning_users;
DROP POLICY IF EXISTS "betatester_returning_insert_open_beta" ON public.betatester_survey_returning_users;

-- Lectura solo para admin (usuarios autenticados con rol admin)
CREATE POLICY "betatester_new_select_admin"
  ON public.betatester_survey_new_users
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "betatester_returning_select_admin"
  ON public.betatester_survey_returning_users
  FOR SELECT
  USING (public.is_admin());

-- Inserción permitida para beta cerrada sin login.
-- El control real de acceso se valida en server action con código beta.
CREATE POLICY "betatester_new_insert_open_beta"
  ON public.betatester_survey_new_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "betatester_returning_insert_open_beta"
  ON public.betatester_survey_returning_users
  FOR INSERT
  WITH CHECK (true);

GRANT INSERT ON public.betatester_survey_new_users TO anon, authenticated;
GRANT INSERT ON public.betatester_survey_returning_users TO anon, authenticated;
GRANT SELECT ON public.betatester_survey_new_users TO authenticated;
GRANT SELECT ON public.betatester_survey_returning_users TO authenticated;

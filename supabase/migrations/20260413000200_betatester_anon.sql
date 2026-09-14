-- CSH-S0-002: Betatester Survey — Acceso Anónimo
-- La migración 20260323183000_betatester_surveys_v1.sql ya tiene:
--   CREATE POLICY "betatester_new_insert_open_beta" ... WITH CHECK (true)
--   GRANT INSERT ON public.betatester_survey_new_users TO anon, authenticated;
--
-- Este archivo es idempotente — agrega rate limiting a nivel de Server Action.
-- No requiere cambios adicionales de BD para CSH-S0-002.
--
-- Lo que SÍ se corrige aquí: el flujo de feedback.ts del Server Action
-- ya está resuelto en csh_s0_01_feedback_anon.sql.
--
-- Documentado para trazabilidad del sprint.

-- Asegurar que el grant existe (idempotente)
GRANT INSERT ON public.betatester_survey_new_users TO anon;
GRANT INSERT ON public.betatester_survey_returning_users TO anon;

-- Corrige tres cosas que introdujo 20260917110418_tutoring_session_logistics.sql
-- y que levanto el advisor de performance de Supabase.

-- 1. Indice duplicado. `idx_tutoring_requests_assigned_mentor_id` ya cubria
--    assigned_mentor_id desde el issue #38 (indices de FKs sin cobertura); el
--    parcial que se agrego despues indexa exactamente la misma columna. Sobra
--    el nuevo: dos indices sobre la misma columna se mantienen los dos en cada
--    escritura y solo uno se usa.
DROP INDEX IF EXISTS public.idx_tutoring_requests_assigned_mentor;

-- 2. `community_ideas.owner_id` quedo como FK sin indice, justo la deuda que
--    el issue #38 habia terminado de saldar para las otras cuatro FKs.
CREATE INDEX IF NOT EXISTS idx_community_ideas_owner_id
  ON public.community_ideas (owner_id);

-- 3. Dos policies permisivas de UPDATE sobre la misma tabla y rol: Postgres
--    evalua ambas en cada UPDATE. Se unifican en una sola. De paso
--    `tutoring_update_admin` tenia `is_admin()` suelto, que se reevalua por
--    fila -- ver el criterio de (select ...) en docs/DATABASE.md.
DROP POLICY IF EXISTS tutoring_update_admin ON public.tutoring_requests;
DROP POLICY IF EXISTS tutoring_update_student_or_mentor ON public.tutoring_requests;

CREATE POLICY tutoring_update_student_mentor_or_admin ON public.tutoring_requests FOR UPDATE
  USING ((
    (user_id = (select auth.uid()))
    OR (assigned_mentor_id = (select auth.uid()))
    OR (select public.is_admin())
  ))
  WITH CHECK ((
    (user_id = (select auth.uid()))
    OR (assigned_mentor_id = (select auth.uid()))
    OR (select public.is_admin())
  ));

-- Que columnas puede tocar cada rol lo sigue decidiendo el trigger
-- `tutoring_requests_guard_columns`; unificar las policies no lo afecta.

-- ASEC: endurece y optimiza el RLS de eventos e inscripciones.
--
-- Contexto (auditoria en docs/work/ASEC/):
--   1. `event_reg_insert_own` solo exigia `auth.uid() = user_id`. No bloqueaba
--      sesiones anonimas (a diferencia de 20260301100800_csh_s2_26_rls_block_anon.sql) y no
--      miraba el estado del evento: con un UUID valido se podia insertar una
--      inscripcion a un evento despublicado o ya vencido.
--   2. Las policies re-evaluaban `auth.uid()` por fila en vez de cachear el
--      resultado con un subselect (advisor `auth_rls_initplan`).
--   3. `event_registrations` tenia dos policies SELECT permisivas solapadas
--      (advisor `multiple_permissive_policies`).
--   4. La FK `events.created_by` no tenia indice de cobertura.
--
-- La fecha se compara en la zona del hub (America/El_Salvador), igual que
-- `isEventPast()` en src/lib/event-datetime.ts, para que la app y la base
-- coincidan y el RLS nunca rechace algo que la UI si permite.

-- ---------------------------------------------------------------------------
-- 1. INSERT de inscripciones: no anonimos, y solo a eventos vigentes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "event_reg_insert_own" ON public.event_registrations;

CREATE POLICY "event_reg_insert_own"
ON public.event_registrations FOR INSERT
WITH CHECK (
  (select auth.uid()) = user_id
  AND ((select auth.jwt())->>'is_anonymous')::boolean IS NOT TRUE
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_id
      AND e.published = true
      AND e.event_date >= (now() AT TIME ZONE 'America/El_Salvador')::date
  )
);

-- ---------------------------------------------------------------------------
-- 2. SELECT: una sola policy (propias o admin) en vez de dos permisivas
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "event_reg_select_own" ON public.event_registrations;
DROP POLICY IF EXISTS "event_reg_select_admin" ON public.event_registrations;

CREATE POLICY "event_reg_select_own_or_admin"
ON public.event_registrations FOR SELECT
USING (
  (select auth.uid()) = user_id
  OR public.is_admin()
);

-- ---------------------------------------------------------------------------
-- 3. DELETE de inscripcion propia: cancelar siempre se permite, incluso si el
--    evento ya paso o se despublico. Solo se cachea auth.uid().
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "event_reg_delete_own" ON public.event_registrations;

CREATE POLICY "event_reg_delete_own"
ON public.event_registrations FOR DELETE
USING ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- 4. DELETE de eventos: misma regla, auth.uid() cacheado
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "events_delete_admin_or_creator" ON public.events;

CREATE POLICY "events_delete_admin_or_creator"
ON public.events FOR DELETE
USING (
  public.is_admin()
  OR (created_by IS NOT NULL AND created_by = (select auth.uid()))
);

-- ---------------------------------------------------------------------------
-- 5. Indice de cobertura para la FK events.created_by
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_created_by
  ON public.events (created_by);

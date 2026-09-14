-- Tabla de inscripciones a eventos

CREATE TABLE IF NOT EXISTS public.event_registrations (
  event_id      uuid        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Usuario autenticado puede ver, insertar y eliminar sus propias inscripciones
CREATE POLICY "event_reg_select_own" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "event_reg_insert_own" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_reg_delete_own" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Admin puede ver todas las inscripciones
CREATE POLICY "event_reg_select_admin" ON public.event_registrations
  FOR SELECT USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_event_reg_event_id ON public.event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user_id  ON public.event_registrations (user_id);

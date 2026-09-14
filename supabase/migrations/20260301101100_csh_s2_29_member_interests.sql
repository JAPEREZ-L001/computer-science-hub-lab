-- Tabla de intereses de miembros (MicroIntakeForm)

CREATE TABLE IF NOT EXISTS public.member_interests (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  name       text,
  email      text,
  goals      text[]      NOT NULL DEFAULT '{}',
  detail     text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_interests ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario puede insertar su propio interés
-- (user_id = NULL permite envíos sin sesión activa)
CREATE POLICY "member_interests_insert" ON public.member_interests
  FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Solo admins pueden leer los registros
CREATE POLICY "member_interests_select_admin" ON public.member_interests
  FOR SELECT USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_member_interests_user_id ON public.member_interests (user_id);
CREATE INDEX IF NOT EXISTS idx_member_interests_created  ON public.member_interests (created_at DESC);

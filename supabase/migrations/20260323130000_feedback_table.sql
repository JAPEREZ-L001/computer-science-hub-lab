-- Tabla de feedback/opiniones de usuarios
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden leer feedback
CREATE POLICY "feedback_select_admin" ON public.feedback
  FOR SELECT USING (public.is_admin());

-- Cualquier usuario autenticado puede insertar feedback
CREATE POLICY "feedback_insert_auth" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Índice para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

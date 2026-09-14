-- CSH-S0-001: Feedback Anónimo
-- Permite que usuarios anónimos envíen feedback.
-- Agrega campo is_anonymous y actualiza la RLS policy de INSERT.

-- 1. Agregar columna is_anonymous
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false;

-- 2. Eliminar la policy restrictiva de solo autenticados
DROP POLICY IF EXISTS "feedback_insert_auth" ON public.feedback;

-- 3. Nueva policy: cualquier usuario (incluido anon) puede insertar
--    El rate limiting se controla a nivel de Server Action.
CREATE POLICY "feedback_insert_anyone"
  ON public.feedback
  FOR INSERT
  WITH CHECK (true);

-- 4. Dar permisos de INSERT al rol anon (necesario para usuarios no autenticados)
GRANT INSERT ON public.feedback TO anon;

-- Nota: La protección contra spam se maneja en el Server Action
-- mediante rate limiting por IP (src/lib/rate-limiter.ts).

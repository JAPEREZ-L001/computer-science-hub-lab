-- CSH-33: seguimiento de ejecución de una idea aprobada.
--
-- `status` (open/closed/archived) es moderación: decide si la idea se ve en
-- /comunidad/ideas. No sirve para saber si la idea se está llevando a cabo, que
-- es una dimensión aparte: una idea puede estar cerrada a nuevos votos y a la
-- vez en progreso. De ahí una columna propia en vez de estirar el CHECK de
-- `status`.
--
-- Todas nullable salvo `execution_status`: las ideas existentes no tienen forma
-- de conocer su responsable ni su lugar retroactivamente, y 'proposed' es el
-- estado real de una idea que nadie tomó todavía, no un dato inventado.

ALTER TABLE public.community_ideas
  ADD COLUMN IF NOT EXISTS execution_status text NOT NULL DEFAULT 'proposed'
    CHECK (execution_status IN ('proposed', 'planned', 'in_progress', 'done', 'discarded')),
  ADD COLUMN IF NOT EXISTS execution_notes text,
  ADD COLUMN IF NOT EXISTS owner_id uuid
    REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS scheduled_at date;

-- No se agregan policies: `ideas_update_author_or_admin` ya cubre el UPDATE del
-- admin sobre estas columnas, y no hay ningún action del lado del autor que
-- haga UPDATE sobre `community_ideas` (solo INSERT y DELETE propio), así que
-- estos campos quedan de hecho bajo control exclusivo del panel admin.

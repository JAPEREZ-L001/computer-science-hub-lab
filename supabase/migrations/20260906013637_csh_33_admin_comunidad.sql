-- CSH-33: panel admin de comunidad (moderación de ideas + gestión de tutorías)
--
-- NOTA DE PROCEDENCIA (2026-09-15): este archivo se recupero de la columna
-- `statements` de `supabase_migrations.schema_migrations`. La migracion se
-- aplico a produccion el 2026-09-06 pero su SQL nunca se versiono en el repo,
-- asi que el esquema real tenia tres objetos que ningun archivo explicaba. Se
-- reconstruye tal cual quedo registrado, sin reformatear.
--
-- El esquema existe pero la UI no: el issue #33 sigue abierto. Estas columnas
-- no tienen consumidor todavia.

ALTER TABLE public.community_ideas
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;

ALTER TABLE public.tutoring_requests
  ADD COLUMN IF NOT EXISTS assigned_mentor_id uuid
    REFERENCES auth.users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_community_ideas_pinned
  ON public.community_ideas (pinned)
  WHERE pinned = true;

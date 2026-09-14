-- CSH-25..29: columnas usadas por la UI pública (idempotente)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Si la tabla se creó sin timestamps, la UI usa `created_at` para “Miembro desde”.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

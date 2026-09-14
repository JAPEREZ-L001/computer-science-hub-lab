-- Schema base reconstruido (equivalente a la migración "csh_s2_18_base_schema_public_tables"
-- referenciada en supabase/README.md pero nunca versionada en el repo).
--
-- BL-02 (auditoría post-mortem 2026-09): sin esta migración, `supabase db reset` falla porque
-- todas las migraciones siguientes (RLS, triggers, seeds, ALTER TABLE ADD COLUMN...) asumen que
-- profiles/news/events/opportunities/resources/sponsors ya existen.
--
-- Reconstruido leyendo:
--   - Los ALTER TABLE / REFERENCES a estas tablas en las 22 migraciones existentes
--     (columnas mínimas requeridas por la migración más antigua que las usa: csh_s2_19_rls.sql
--     y csh_s2_20_seed.sql / csh_s2_21_handle_new_user.sql)
--   - Las columnas seleccionadas/insertadas en src/lib/supabase/queries.ts y admin-queries.ts
--
-- Solo incluye las columnas "de día 1": las agregadas después por migraciones dedicadas
-- (bio, github_url, avatar_palette_index, badge, university, created_by, etc.) se dejan a esas
-- migraciones — sus `ADD COLUMN IF NOT EXISTS` siguen siendo no-op seguros si ya existieran aquí.
-- Excepción: `role` y `status` en profiles SÍ se incluyen aquí porque son requisito estructural
-- de is_admin() y de las policies de csh_s2_19_rls.sql, que se ejecuta justo después de esta.
--
-- Nombrada con timestamp 20260301 (anterior a las 22 migraciones existentes) para que
-- `supabase db reset` la aplique primero. No renombra ninguna migración existente — ver BL-03
-- en docs/work/Sprints/Sprint00/Sprint01/ejecucion-log.md para el problema de orden restante
-- entre archivos csh_s2_* y archivos con timestamp real (bloqueador, requiere decisión humana).

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  email text,
  career text,
  cycle integer,
  area text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'activo',
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- news ----------
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  category text NOT NULL DEFAULT 'anuncio',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- events ----------
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time text,
  speaker text,
  type text NOT NULL DEFAULT 'workshop',
  location text,
  registration_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- opportunities ----------
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text,
  description text,
  url text,
  type text NOT NULL DEFAULT 'Pasantía / Primer empleo',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- resources ----------
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text,
  category text NOT NULL DEFAULT 'computacion',
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- sponsors ----------
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  logo_url text,
  website_url text,
  tier text NOT NULL DEFAULT 'colaborador',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

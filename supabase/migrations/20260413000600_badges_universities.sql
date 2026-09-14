-- CSH-S0-006: Bandas y Roles de Usuario
-- Agrega campos badge y university_role a la tabla profiles.
-- Crea tabla universities para la feature multi-universidad (CSH-S0-007).

-- ─────────────────────────────────
-- 1. BADGES DE USUARIO (CSH-S0-006)
-- ─────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badge text
    NOT NULL
    DEFAULT 'member'
    CHECK (badge IN (
      'ceo_founder',
      'primary_agent',
      'primary_fellow',
      'agent',
      'member',
      'fellow',
      'catedratico',
      'estudiante'
    ));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS university_role text
    NOT NULL
    DEFAULT 'estudiante'
    CHECK (university_role IN ('estudiante', 'catedratico'));

-- Sincronizar badge con role existente para datos actuales
UPDATE public.profiles
SET badge = CASE
  WHEN role = 'admin'   THEN 'agent'
  WHEN role = 'agent'   THEN 'agent'
  WHEN role = 'fellow'  THEN 'fellow'
  ELSE 'member'
END
WHERE badge = 'member'; -- solo actualiza los que aún tienen el default

-- Índice para filtrar por badge en el directorio
CREATE INDEX IF NOT EXISTS idx_profiles_badge
  ON public.profiles(badge);

-- ─────────────────────────────────
-- 2. UNIVERSIDADES (CSH-S0-007)
-- ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.universities (
  code        text PRIMARY KEY,
  name        text NOT NULL,
  short_name  text,
  country     text NOT NULL DEFAULT 'El Salvador',
  active      boolean NOT NULL DEFAULT true,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Datos iniciales
INSERT INTO public.universities (code, name, short_name, sort_order) VALUES
  ('UDB',  'Universidad Don Bosco',                               'Don Bosco',  1),
  ('UCA',  'Universidad CentroAmericana José Simeón Cañas',       'UCA',        2),
  ('UES',  'Universidad de El Salvador',                          'UES',        3),
  ('UFG',  'Universidad Francisco Gavidia',                       'UFG',        4),
  ('UEES', 'Universidad Evangélica de El Salvador',               'UEES',       5),
  ('ESEN', 'Escuela Superior de Economía y Negocios',             'ESEN',       6)
ON CONFLICT (code) DO NOTHING;

-- RLS para universities (solo lectura pública, escritura solo admins)
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "universities_select_anyone"
  ON public.universities FOR SELECT
  USING (active = true OR public.is_admin());

CREATE POLICY "universities_insert_admin"
  ON public.universities FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "universities_update_admin"
  ON public.universities FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Grants
GRANT SELECT ON public.universities TO anon, authenticated;

-- ─────────────────────────────────
-- 3. CAMPO UNIVERSITY EN PROFILES (CSH-S0-007)
-- ─────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS university text
    NOT NULL
    DEFAULT 'UDB'
    REFERENCES public.universities(code)
    ON UPDATE CASCADE;

-- Índice para filtrar directorio por universidad
CREATE INDEX IF NOT EXISTS idx_profiles_university
  ON public.profiles(university);

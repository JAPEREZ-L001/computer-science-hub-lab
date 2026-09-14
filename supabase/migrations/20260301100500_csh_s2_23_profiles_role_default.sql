-- Rol de perfil para RLS / panel admin (is_admin)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'member';

COMMENT ON COLUMN public.profiles.role IS 'member | admin — usar admin con cuidado (CSH-19 is_admin)';

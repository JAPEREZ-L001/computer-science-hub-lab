-- Backfill de perfiles faltantes.
--
-- Contexto: 8 de 23 usuarios de auth.users no tenian fila en public.profiles.
-- Sus altas estan intercaladas con las de usuarios que si la tienen, y el
-- trigger on_auth_user_created existe y funciona hoy, asi que fue una perdida
-- puntual (borrado manual o fallo intermitente), no un trigger que llego tarde.
--
-- Sin perfil, un usuario real no tiene nombre que mostrar: toda la UI cae al
-- literal 'Miembro'. Eso degrada inscripciones a eventos, autoria de ideas,
-- ranking y directorio de mentores a la vez.
--
-- La metadata de signUp sigue en auth.users.raw_user_meta_data, asi que los
-- nombres reales se pueden recuperar.

-- ---------------------------------------------------------------------------
-- Funcion de reconciliacion: misma logica que handle_new_user(), pero
-- set-based e idempotente. Queda disponible para re-correrla si se detecta
-- deriva otra vez, en vez de tener que reescribir el SQL a mano.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reconcile_missing_profiles()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted integer;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, career, cycle, area, status)
  SELECT
    u.id,
    NULLIF(TRIM(COALESCE(u.raw_user_meta_data->>'full_name', '')), ''),
    u.email,
    NULLIF(TRIM(COALESCE(u.raw_user_meta_data->>'career', '')), ''),
    -- handle_new_user() usa un bloque EXCEPTION por fila para el cast; aca la
    -- insercion es set-based, asi que se filtra con regex para el mismo efecto.
    CASE
      WHEN (u.raw_user_meta_data->>'cycle') ~ '^[0-9]+$'
      THEN (u.raw_user_meta_data->>'cycle')::integer
    END,
    COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'area'), ''), 'general'),
    CASE
      WHEN (u.raw_app_meta_data->>'provider') = 'anonymous' THEN 'inactivo'
      ELSE 'activo'
    END
  FROM auth.users u
  WHERE u.deleted_at IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  ON CONFLICT (id) DO NOTHING;

  GET DIAGNOSTICS inserted = ROW_COUNT;
  RETURN inserted;
END;
$$;

COMMENT ON FUNCTION public.reconcile_missing_profiles() IS
  'Crea las filas de public.profiles faltantes para usuarios de auth.users. Idempotente.';

-- No es para usuarios finales: solo mantenimiento.
REVOKE ALL ON FUNCTION public.reconcile_missing_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_missing_profiles() TO service_role;

-- ---------------------------------------------------------------------------
-- Ejecucion del backfill
-- ---------------------------------------------------------------------------
SELECT public.reconcile_missing_profiles();

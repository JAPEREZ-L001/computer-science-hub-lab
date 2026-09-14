-- Perfiles anónimos: status inactivo (no aparecen en directorio)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cycle_val integer;
  is_anon boolean;
  profile_status text;
BEGIN
  is_anon := (NEW.raw_app_meta_data->>'provider') = 'anonymous';
  profile_status := CASE WHEN is_anon THEN 'inactivo' ELSE 'activo' END;

  BEGIN
    cycle_val := (NEW.raw_user_meta_data->>'cycle')::integer;
  EXCEPTION
    WHEN others THEN
      cycle_val := NULL;
  END;

  INSERT INTO public.profiles (id, full_name, email, career, cycle, area, status)
  VALUES (
    NEW.id,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NEW.email,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'career', '')), ''),
    cycle_val,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'area'), ''), 'general'),
    profile_status
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

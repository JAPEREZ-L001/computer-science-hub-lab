-- CSH-21: Perfil automático al crear usuario en auth.users (metadata desde signUp)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cycle_val integer;
BEGIN
  BEGIN
    cycle_val := (NEW.raw_user_meta_data->>'cycle')::integer;
  EXCEPTION
    WHEN others THEN
      cycle_val := NULL;
  END;

  INSERT INTO public.profiles (id, full_name, email, career, cycle, area)
  VALUES (
    NEW.id,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NEW.email,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'career', '')), ''),
    cycle_val,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'area'), ''), 'general')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

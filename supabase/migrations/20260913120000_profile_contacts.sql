-- Correo personal de respaldo (backup contact), separado de `profiles`.
--
-- `profiles` tiene SELECT abierto a `anon`/`authenticated` sobre TODAS sus
-- columnas (RLS solo filtra filas: `status='activo' OR auth.uid()=id OR
-- is_admin()`), asi que cualquiera con la clave publica de Supabase puede leer
-- cualquier columna de un perfil activo directamente contra la REST API, sin
-- pasar por el codigo de Next.js. Guardar el correo personal ahi lo expondria
-- de la misma forma. Por eso vive en su propia tabla con RLS dueño/admin
-- unicamente y sin GRANT a `anon`.

CREATE TABLE public.profile_contacts (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_email text,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_contacts_select_own_or_admin"
  ON public.profile_contacts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "profile_contacts_insert_own"
  ON public.profile_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile_contacts_update_own_or_admin"
  ON public.profile_contacts FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "profile_contacts_delete_own_or_admin"
  ON public.profile_contacts FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- Sin GRANT a `anon`: la captura en el registro pasa por raw_user_meta_data +
-- el trigger SECURITY DEFINER de abajo, que ignora RLS.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_contacts TO authenticated;

-- Extiende el trigger de creacion de perfil (CSH-21) para tambien guardar el
-- correo personal opcional pasado en el metadata del signUp.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cycle_val integer;
  personal_email_val text;
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

  personal_email_val := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'personal_email', '')), '');

  IF personal_email_val IS NOT NULL THEN
    INSERT INTO public.profile_contacts (user_id, personal_email)
    VALUES (NEW.id, personal_email_val)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

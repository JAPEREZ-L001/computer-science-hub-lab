-- Bootstrap del primer admin
-- Editá 'TU_EMAIL_AQUI@example.com' con el email del primer administrador
-- y ejecutá: supabase db push
-- Este script es idempotente: solo actúa si NO existe ningún admin todavía.

DO $$
DECLARE
  target_email text := 'TU_EMAIL_AQUI@example.com';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = target_email;

    IF NOT FOUND THEN
      RAISE WARNING 'No se encontró un perfil con el email "%". Asegurate de que el usuario ya se haya registrado antes de correr esta migración.', target_email;
    ELSE
      RAISE NOTICE 'Primer admin asignado exitosamente: %', target_email;
    END IF;
  ELSE
    RAISE NOTICE 'Ya existe al menos un admin. No se realizaron cambios.';
  END IF;
END;
$$;

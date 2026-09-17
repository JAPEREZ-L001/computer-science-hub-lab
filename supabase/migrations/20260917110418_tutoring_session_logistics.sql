-- CSH-33: logistica y seguimiento de una tutoria emparejada.
--
-- Hasta ahora una tutoria pasaba a 'matched' y ahi moria: ni el alumno ni el
-- mentor tenian donde ver el aula, la hora ni los temas a reforzar, y el mentor
-- ni siquiera podia LEER las solicitudes que se le asignaban (la policy de
-- SELECT solo contemplaba al alumno y al admin).

-- ---------- Columnas ----------

ALTER TABLE public.tutoring_requests
  -- Fijadas por el mentor o el admin.
  ADD COLUMN IF NOT EXISTS session_location text,
  ADD COLUMN IF NOT EXISTS session_at timestamptz,
  ADD COLUMN IF NOT EXISTS mentor_notes text,
  -- Lo escribe el alumno: que quiere que se refuerce en la sesion.
  ADD COLUMN IF NOT EXISTS reinforcement_topics text;

-- El mentor entra a su agenda filtrando por `assigned_mentor_id`; sin indice eso
-- es un seq scan sobre toda la tabla en cada carga de /comunidad/tutorias.
CREATE INDEX IF NOT EXISTS idx_tutoring_requests_assigned_mentor
  ON public.tutoring_requests (assigned_mentor_id)
  WHERE assigned_mentor_id IS NOT NULL;

-- ---------- RLS ----------

-- El mentor asignado tiene que poder ver la solicitud. Sin esto su agenda sale
-- siempre vacia por mas que la UI la pida.
DROP POLICY IF EXISTS tutoring_select_own_or_admin ON public.tutoring_requests;
CREATE POLICY tutoring_select_own_or_admin ON public.tutoring_requests FOR SELECT
  USING ((
    (user_id = (select auth.uid()))
    OR (assigned_mentor_id = (select auth.uid()))
    OR (select public.is_admin())
  ));

-- Alumno y mentor pueden actualizar su propia fila. QUE columnas puede tocar
-- cada uno lo decide el trigger de abajo: una policy no puede comparar OLD con
-- NEW, asi que por si sola dejaria al alumno reasignarse el mentor o cerrarse
-- la tutoria llamando a PostgREST directo con su JWT.
DROP POLICY IF EXISTS tutoring_update_student_or_mentor ON public.tutoring_requests;
CREATE POLICY tutoring_update_student_or_mentor ON public.tutoring_requests FOR UPDATE
  USING ((
    (user_id = (select auth.uid()))
    OR (assigned_mentor_id = (select auth.uid()))
  ))
  WITH CHECK ((
    (user_id = (select auth.uid()))
    OR (assigned_mentor_id = (select auth.uid()))
  ));

-- ---------- Guarda de columnas ----------

CREATE OR REPLACE FUNCTION public.tutoring_requests_guard_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  -- Sin JWT no hay usuario que restringir: es acceso directo a la base (SQL
  -- editor, service_role, mantenimiento del dueno), que tampoco pasa por RLS.
  -- Un trigger si corre siempre, asi que sin esta salida un UPDATE manual
  -- quedaria bloqueado.
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- El admin no tiene restricciones: gestiona todo desde /admin/tutorias.
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF uid IS NOT NULL AND uid = OLD.assigned_mentor_id THEN
    -- Mentor: agenda la sesion y deja el seguimiento. No puede reasignarse la
    -- tutoria a otra persona ni reescribir lo que pidio el alumno.
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.assigned_mentor_id IS DISTINCT FROM OLD.assigned_mentor_id
       OR NEW.topic IS DISTINCT FROM OLD.topic
       OR NEW.details IS DISTINCT FROM OLD.details
       OR NEW.preferred_schedule IS DISTINCT FROM OLD.preferred_schedule
       OR NEW.reinforcement_topics IS DISTINCT FROM OLD.reinforcement_topics
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'El mentor solo puede modificar la sesion y sus notas.';
    END IF;
    RETURN NEW;
  END IF;

  IF uid IS NOT NULL AND uid = OLD.user_id THEN
    -- Alumno: solo los temas que quiere reforzar. El estado, el mentor y la
    -- logistica no son suyos.
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.assigned_mentor_id IS DISTINCT FROM OLD.assigned_mentor_id
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.session_location IS DISTINCT FROM OLD.session_location
       OR NEW.session_at IS DISTINCT FROM OLD.session_at
       OR NEW.mentor_notes IS DISTINCT FROM OLD.mentor_notes
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Solo podes editar los temas a reforzar de tu solicitud.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'No tenes permiso para modificar esta solicitud.';
END;
$$;

DROP TRIGGER IF EXISTS tutoring_requests_guard_columns ON public.tutoring_requests;
CREATE TRIGGER tutoring_requests_guard_columns
  BEFORE UPDATE ON public.tutoring_requests
  FOR EACH ROW EXECUTE FUNCTION public.tutoring_requests_guard_columns();

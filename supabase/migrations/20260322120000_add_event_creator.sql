-- Agrega campo created_by a la tabla events para controlar quién puede eliminar
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Política: Admin puede borrar cualquier evento. El creador puede borrar el suyo.
DROP POLICY IF EXISTS "events_delete_admin" ON public.events;

CREATE POLICY "events_delete_admin_or_creator" ON public.events
  FOR DELETE USING (
    public.is_admin()
    OR (created_by IS NOT NULL AND created_by = auth.uid())
  );

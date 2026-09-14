-- Permite que el autor de una idea pueda eliminar su propia idea.
--
-- app/comunidad/actions.ts:deleteOwnIdea ya hace
--   DELETE FROM community_ideas WHERE id = :id AND author_id = auth.uid()
-- pero la unica policy DELETE existente (ideas_delete_admin, csh_s2_24_community.sql)
-- solo permite is_admin(). Postgres combina policies permisivas del mismo comando con OR,
-- asi que basta con agregar una policy adicional para el autor sin tocar la existente.

CREATE POLICY "ideas_delete_own"
ON public.community_ideas FOR DELETE
USING (author_id = auth.uid());

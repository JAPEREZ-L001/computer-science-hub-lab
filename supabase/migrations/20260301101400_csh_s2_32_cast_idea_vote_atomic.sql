-- BL-16: voto de ideas atomico + fix de bug oculto en el incremento de vote_count.
--
-- Problema 1 (B03 del reporte): app/comunidad/actions.ts:voteCommunityIdea hacia un INSERT en
-- community_idea_votes y despues, por separado, llamaba a la RPC increment_idea_vote_count. Si el
-- proceso fallaba entre ambos pasos, el voto quedaba registrado pero vote_count nunca se actualizaba
-- (y un reintento del usuario fallaria por el UNIQUE (idea_id, user_id), dejando el conteo
-- permanentemente desincronizado para ese voto).
--
-- Problema 2 (no documentado en el reporte, encontrado al revisar esto): increment_idea_vote_count
-- (csh_s2_25_rpc_increment_vote.sql) es SECURITY INVOKER. La policy "ideas_update_author_or_admin"
-- en community_ideas exige author_id = auth.uid() OR is_admin() para cualquier UPDATE -- incluido
-- este. Es decir: votar la idea de OTRO usuario (el caso normal) hace que el UPDATE de vote_count
-- afecte 0 filas por RLS, en silencio (sin error). El voto se guarda en community_idea_votes pero
-- el contador nunca sube salvo que votes tu propia idea o seas admin.
--
-- Fix: una unica funcion SECURITY DEFINER que hace INSERT + UPDATE en una sola transaccion
-- implicita (todo-o-nada) y evita la RLS de community_ideas para el UPDATE del contador, con los
-- mismos checks de autenticacion que ya aplican las policies actuales (usuario no anonimo).

CREATE OR REPLACE FUNCTION public.cast_idea_vote(p_idea_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL OR (auth.jwt()->>'is_anonymous')::boolean IS TRUE THEN
    RAISE EXCEPTION 'Debes iniciar sesión para votar.' USING ERRCODE = '28000';
  END IF;

  INSERT INTO public.community_idea_votes (idea_id, user_id)
  VALUES (p_idea_id, v_user_id);

  UPDATE public.community_ideas
  SET vote_count = vote_count + 1
  WHERE id = p_idea_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cast_idea_vote(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cast_idea_vote(uuid) TO authenticated;

-- increment_idea_vote_count (csh_s2_25) se deja intacta por compatibilidad/historial;
-- app/comunidad/actions.ts deja de llamarla y usa cast_idea_vote en su lugar.

-- C-01: Incremento atómico de vote_count (elimina race condition TOCTOU)
-- L-05: CHECK constraint vote_count >= 0

-- Constraint para evitar contadores negativos
ALTER TABLE public.community_ideas
  ADD CONSTRAINT community_ideas_vote_count_non_negative
  CHECK (vote_count >= 0);

-- RPC para incrementar vote_count de forma atómica
CREATE OR REPLACE FUNCTION public.increment_idea_vote_count(idea_id uuid)
RETURNS void
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.community_ideas
  SET vote_count = vote_count + 1
  WHERE id = idea_id;
$$;

REVOKE ALL ON FUNCTION public.increment_idea_vote_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_idea_vote_count(uuid) TO authenticated;

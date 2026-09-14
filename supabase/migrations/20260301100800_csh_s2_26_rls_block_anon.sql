-- C-02: Bloquear usuarios anónimos en políticas INSERT de comunidad
-- H-05: Agregar política DELETE para profiles (admin only)

-- ---- community_ideas: reescribir INSERT ----
DROP POLICY IF EXISTS "ideas_insert_authenticated" ON public.community_ideas;

CREATE POLICY "ideas_insert_authenticated"
ON public.community_ideas FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
  AND (author_id IS NULL OR author_id = auth.uid())
);

-- ---- community_idea_votes: reescribir INSERT ----
DROP POLICY IF EXISTS "idea_votes_insert_own" ON public.community_idea_votes;

CREATE POLICY "idea_votes_insert_own"
ON public.community_idea_votes FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
);

-- ---- tutoring_requests: reescribir INSERT ----
DROP POLICY IF EXISTS "tutoring_insert_own" ON public.tutoring_requests;

CREATE POLICY "tutoring_insert_own"
ON public.tutoring_requests FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
);

-- ---- mentor_matching_profiles: reescribir INSERT ----
DROP POLICY IF EXISTS "mentor_profiles_upsert_own" ON public.mentor_matching_profiles;

CREATE POLICY "mentor_profiles_upsert_own"
ON public.mentor_matching_profiles FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE
);

-- ---- profiles: política DELETE (admin only) ----
CREATE POLICY "profiles_delete_admin"
ON public.profiles FOR DELETE
USING (public.is_admin());

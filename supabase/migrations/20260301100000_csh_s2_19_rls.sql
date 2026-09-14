-- CSH-19: Row Level Security (no modifica respuestas_betatesters)
-- Helper: detectar admin sin recursión RLS en profiles

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ---------- profiles ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
USING (
  status = 'activo'
  OR auth.uid() = id
  OR public.is_admin()
);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own_or_admin"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ---------- news ----------
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_select_published_or_admin"
ON public.news FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "news_insert_admin"
ON public.news FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "news_update_admin"
ON public.news FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "news_delete_admin"
ON public.news FOR DELETE
USING (public.is_admin());

-- ---------- events ----------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select_published_or_admin"
ON public.events FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "events_insert_admin"
ON public.events FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "events_update_admin"
ON public.events FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "events_delete_admin"
ON public.events FOR DELETE
USING (public.is_admin());

-- ---------- opportunities ----------
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_select_published_or_admin"
ON public.opportunities FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "opportunities_insert_admin"
ON public.opportunities FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "opportunities_update_admin"
ON public.opportunities FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "opportunities_delete_admin"
ON public.opportunities FOR DELETE
USING (public.is_admin());

-- ---------- resources ----------
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select_published_or_admin"
ON public.resources FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "resources_insert_admin"
ON public.resources FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "resources_update_admin"
ON public.resources FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "resources_delete_admin"
ON public.resources FOR DELETE
USING (public.is_admin());

-- ---------- sponsors ----------
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsors_select_active_or_admin"
ON public.sponsors FOR SELECT
USING (active = true OR public.is_admin());

CREATE POLICY "sponsors_insert_admin"
ON public.sponsors FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "sponsors_update_admin"
ON public.sponsors FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "sponsors_delete_admin"
ON public.sponsors FOR DELETE
USING (public.is_admin());

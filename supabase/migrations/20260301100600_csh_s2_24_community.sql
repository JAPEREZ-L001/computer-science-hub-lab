-- CSH-34..41: módulos de comunidad (contenido curado + interacción miembros)

-- ---------- Documentación del hub (CSH-35) ----------
CREATE TABLE IF NOT EXISTS public.hub_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hub_documents_select_published_or_admin"
ON public.hub_documents FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "hub_documents_write_admin"
ON public.hub_documents FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------- Podcast / media (CSH-36) ----------
CREATE TABLE IF NOT EXISTS public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  episode_url text NOT NULL,
  platform text NOT NULL DEFAULT 'web',
  published_at timestamptz,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "podcast_select_published_or_admin"
ON public.podcast_episodes FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "podcast_write_admin"
ON public.podcast_episodes FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------- Investigación y publicaciones (CSH-37) ----------
CREATE TABLE IF NOT EXISTS public.research_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  authors text,
  venue text,
  year integer,
  url text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.research_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_select_published_or_admin"
ON public.research_publications FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "research_write_admin"
ON public.research_publications FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------- Ranking / competencias — vista pública (CSH-38) ----------
CREATE TABLE IF NOT EXISTS public.community_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  badge text,
  area text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_select_published_or_admin"
ON public.community_leaderboard FOR SELECT
USING (published = true OR public.is_admin());

CREATE POLICY "leaderboard_write_admin"
ON public.community_leaderboard FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------- Ideas + votos (CSH-39) ----------
CREATE TABLE IF NOT EXISTS public.community_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  author_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  vote_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_idea_votes (
  idea_id uuid NOT NULL REFERENCES public.community_ideas (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (idea_id, user_id)
);

ALTER TABLE public.community_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_idea_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ideas_select_open_or_admin"
ON public.community_ideas FOR SELECT
USING (status = 'open' OR public.is_admin());

CREATE POLICY "ideas_insert_authenticated"
ON public.community_ideas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (author_id IS NULL OR author_id = auth.uid()));

CREATE POLICY "ideas_update_author_or_admin"
ON public.community_ideas FOR UPDATE
USING (author_id = auth.uid() OR public.is_admin())
WITH CHECK (author_id = auth.uid() OR public.is_admin());

CREATE POLICY "ideas_delete_admin"
ON public.community_ideas FOR DELETE
USING (public.is_admin());

CREATE POLICY "idea_votes_select_own"
ON public.community_idea_votes FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "idea_votes_insert_own"
ON public.community_idea_votes FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "idea_votes_delete_own"
ON public.community_idea_votes FOR DELETE
USING (user_id = auth.uid() OR public.is_admin());

-- ---------- Tutorías — solicitudes (CSH-34) ----------
CREATE TABLE IF NOT EXISTS public.tutoring_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  topic text NOT NULL,
  details text,
  preferred_schedule text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutoring_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutoring_select_own_or_admin"
ON public.tutoring_requests FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "tutoring_insert_own"
ON public.tutoring_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tutoring_update_admin"
ON public.tutoring_requests FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------- Matching mentor–estudiante (CSH-40) ----------
CREATE TABLE IF NOT EXISTS public.mentor_matching_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('mentor', 'student', 'both')),
  topics text,
  availability text,
  bio_short text,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentor_matching_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentor_profiles_select_directory_or_own_or_admin"
ON public.mentor_matching_profiles FOR SELECT
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR (
    active = true
    AND role IN ('mentor', 'both')
    AND auth.uid() IS NOT NULL
  )
);

CREATE POLICY "mentor_profiles_upsert_own"
ON public.mentor_matching_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "mentor_profiles_update_own_or_admin"
ON public.mentor_matching_profiles FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "mentor_profiles_delete_own_or_admin"
ON public.mentor_matching_profiles FOR DELETE
USING (user_id = auth.uid() OR public.is_admin());

-- ---------- Seed idempotente (solo si tablas vacías) ----------
INSERT INTO public.hub_documents (title, description, url, category, sort_order, published)
SELECT * FROM (VALUES
  ('Guía de bienvenida al Hub', 'Cómo participar, canales y código de conducta.', 'https://example.com/docs/bienvenida', 'onboarding', 1, true),
  ('Estándares de commits y PRs', 'Convenciones para contribuir a repos del Hub.', 'https://example.com/docs/git', 'ingenieria', 2, true),
  ('Plantilla de proyecto final', 'Estructura sugerida y rúbrica base.', 'https://example.com/docs/plantilla-proyecto', 'academico', 3, true),
  ('Accesibilidad en interfaces', 'Checklist rápido para demos y entregas.', 'https://example.com/docs/a11y', 'diseno', 4, true)
) AS v(title, description, url, category, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.hub_documents LIMIT 1);

INSERT INTO public.podcast_episodes (title, summary, episode_url, platform, published_at, published, sort_order)
SELECT * FROM (VALUES
  ('Ep. 01 — Origen del Computer Science Hub', 'Conversación con fundadores y visión del ecosistema.', 'https://example.com/podcast/ep01', 'web', '2026-02-01T12:00:00Z'::timestamptz, true, 1),
  ('Ep. 02 — De la universidad a la industria', 'Panel con egresados en nearshore y startups.', 'https://example.com/podcast/ep02', 'web', '2026-02-15T12:00:00Z'::timestamptz, true, 2),
  ('Ep. 03 — IA aplicada sin humo', 'Casos reales y limitaciones técnicas.', 'https://example.com/podcast/ep03', 'web', '2026-03-01T12:00:00Z'::timestamptz, true, 3)
) AS v(title, summary, episode_url, platform, published_at, published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.podcast_episodes LIMIT 1);

INSERT INTO public.research_publications (title, authors, venue, year, url, published, sort_order)
SELECT * FROM (VALUES
  ('Aprendizaje federado en dispositivos limitados', 'CSH Lab', 'Jornadas UDB', 2025, 'https://example.com/papers/federated', true, 1),
  ('Visualización de algoritmos para principiantes', 'A. López et al.', 'Poster — Hackathon UDB', 2026, NULL::text, true, 2),
  ('Buenas prácticas de seguridad en proyectos estudiantiles', 'CSH Security', 'Tech talk interno', 2026, NULL::text, true, 3)
) AS v(title, authors, venue, year, url, published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.research_publications LIMIT 1);

INSERT INTO public.community_leaderboard (display_name, points, badge, area, sort_order, published)
SELECT * FROM (VALUES
  ('Equipo demo Frontend', 420, 'Builder', 'frontend', 1, true),
  ('Equipo demo Backend', 390, 'Shipper', 'backend', 2, true),
  ('Comunidad IA', 355, 'Explorer', 'ia', 3, true),
  ('Lab Seguridad', 310, 'Guardian', 'seguridad', 4, true),
  ('Mentores CSH', 280, 'Guide', 'general', 5, true)
) AS v(display_name, points, badge, area, sort_order, published)
WHERE NOT EXISTS (SELECT 1 FROM public.community_leaderboard LIMIT 1);

INSERT INTO public.community_ideas (title, description, author_id, vote_count, status)
SELECT title, description, NULL::uuid, vc, 'open'
FROM (VALUES
  ('Espacio físico 24/7 para proyectos', 'Propuesta de sala compartida con reserva por slots.', 12),
  ('Biblioteca de kits de hardware', 'Arduino y sensores prestables con inventario en app.', 8),
  ('Mentorías cruzadas por ciclo', 'Pares de ciclo alto con ciclo bajo en retos quincenales.', 15)
) AS v(title, description, vc)
WHERE NOT EXISTS (SELECT 1 FROM public.community_ideas LIMIT 1);

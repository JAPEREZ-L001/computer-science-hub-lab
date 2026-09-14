-- L-03: Índices en columnas frecuentemente filtradas

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_area ON public.profiles (area);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news (published);
CREATE INDEX IF NOT EXISTS idx_events_published ON public.events (published);
CREATE INDEX IF NOT EXISTS idx_opportunities_published ON public.opportunities (published);
CREATE INDEX IF NOT EXISTS idx_resources_published ON public.resources (published);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsors (active);
CREATE INDEX IF NOT EXISTS idx_community_ideas_status ON public.community_ideas (status);
CREATE INDEX IF NOT EXISTS idx_community_idea_votes_user ON public.community_idea_votes (user_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_requests_user ON public.tutoring_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_active_role ON public.mentor_matching_profiles (active, role);

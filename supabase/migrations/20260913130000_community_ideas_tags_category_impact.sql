-- CSH-28: clasificacion de ideas (tags, categoria e impacto).
--
-- Las tres columnas son nullable a proposito: las ideas ya existentes no tienen
-- forma de clasificarse retroactivamente, y forzar un default las etiquetaria
-- con datos inventados. `tags` si lleva default '{}' porque un array vacio es
-- la ausencia de tags, no un valor inventado.

ALTER TABLE public.community_ideas
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IS NULL OR category IN ('feature', 'improvement', 'bug', 'other')),
  ADD COLUMN IF NOT EXISTS impact text
    CHECK (impact IS NULL OR impact IN ('high', 'medium', 'low'));

-- Filtrar por categoria/impacto es el caso de uso que motiva estas columnas
-- (ver issue #29), y el listado ya filtra por status = 'open'.
CREATE INDEX IF NOT EXISTS idx_community_ideas_category
  ON public.community_ideas(category) WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_ideas_impact
  ON public.community_ideas(impact) WHERE impact IS NOT NULL;

-- GIN para contencion sobre el array (`tags @> '{x}'`), que es como se filtrara.
CREATE INDEX IF NOT EXISTS idx_community_ideas_tags
  ON public.community_ideas USING GIN(tags);

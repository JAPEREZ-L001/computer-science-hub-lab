-- CSH-S0-005: foro abierto con Supabase Realtime (MVP).
--
-- Dos tablas en vez del schema plano propuesto originalmente en
-- docs/_archive/2026-04-13-sprint00/BacklogBruto.md (forum_messages con un
-- campo `channel TEXT` suelto): `forum_channels` da integridad referencial
-- y permite agregar/renombrar canales sin migrar texto libre, y es lo que
-- pide la seccion "Alcance de la epica" de BACKLOG.md S7 ("Backend: Tablas:
-- forum_channels, forum_messages").
--
-- Alcance de este MVP: 1 canal ("general"), lectura publica, escritura solo
-- para autenticados no-anonimos. Foros por area de interes (CSH-S0-009) y
-- notificaciones quedan fuera, son extension futura segun el propio issue.

-- ---------------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------------
CREATE TABLE public.forum_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.forum_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.forum_channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orden natural de lectura (mensajes de un canal, mas recientes primero) y
-- cobertura de la FK author_id (advisor unindexed_foreign_keys).
CREATE INDEX idx_forum_messages_channel_created
  ON public.forum_messages (channel_id, created_at DESC);

CREATE INDEX idx_forum_messages_author
  ON public.forum_messages (author_id);

-- ---------------------------------------------------------------------------
-- 2. RLS: lectura publica, escritura solo autenticados no-anonimos
-- ---------------------------------------------------------------------------
ALTER TABLE public.forum_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_channels_select_all"
ON public.forum_channels FOR SELECT
USING (true);

CREATE POLICY "forum_messages_select_all"
ON public.forum_messages FOR SELECT
USING (true);

CREATE POLICY "forum_messages_insert_authenticated"
ON public.forum_messages FOR INSERT
WITH CHECK (
  (select auth.uid()) IS NOT NULL
  AND ((select auth.jwt())->>'is_anonymous')::boolean IS NOT TRUE
  AND author_id = (select auth.uid())
);

CREATE POLICY "forum_messages_delete_own_or_admin"
ON public.forum_messages FOR DELETE
USING (
  author_id = (select auth.uid())
  OR public.is_admin()
);

-- Canales gestionados solo por admin (crear/renombrar/reordenar).
CREATE POLICY "forum_channels_write_admin"
ON public.forum_channels FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Seed: el canal general que pide el criterio de aceptacion del MVP
-- ---------------------------------------------------------------------------
INSERT INTO public.forum_channels (slug, name, description, sort_order)
VALUES ('general', 'General', 'Charla abierta del Hub: lo que sea, para quien sea.', 0);

-- ---------------------------------------------------------------------------
-- 4. Realtime: publicar forum_messages para suscripcion en vivo
-- ---------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_messages;

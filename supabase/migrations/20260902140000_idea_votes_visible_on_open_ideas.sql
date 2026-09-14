-- Hacer visibles los votos de ideas abiertas para usuarios autenticados.
--
-- Problema: components/comunidad/ideas-board.tsx renderiza un stack de avatares
-- con los votantes de cada idea, y fetchCommunityIdeas() consulta
-- community_idea_votes para armarlo. Pero la policy vigente es:
--
--   idea_votes_select_own: USING (user_id = auth.uid() OR public.is_admin())
--
-- es decir, cada usuario solo ve SU propio voto. El resultado practico es que
-- la fila de avatares nunca muestra a nadie mas: un visitante sin sesion no ve
-- ninguno, y un usuario autenticado se ve unicamente a si mismo en las ideas
-- que voto. La UI existia pero no tenia datos que mostrar.
--
-- Decision de privacidad: el tablero de ideas es una licitacion publica de la
-- comunidad, y mostrar quien apoya cada propuesta es justamente el punto (da
-- señal social y evita votos fantasma). Se abre la lectura, pero acotada:
--
--   * Solo usuarios autenticados y NO anonimos. Un visitante sin cuenta sigue
--     viendo el conteo agregado (community_ideas.vote_count), nunca los nombres.
--   * Solo votos de ideas con status = 'open'. Los votos de ideas cerradas o
--     archivadas dejan de ser legibles para terceros.
--   * El voto propio sigue siendo legible siempre, sin importar el status, para
--     que la UI pueda seguir marcando "Ya votaste".
--
-- Si mas adelante se decide que el voto debe ser secreto, el camino es revertir
-- esta policy y exponer solo agregados via una vista SECURITY DEFINER.

DROP POLICY IF EXISTS "idea_votes_select_own" ON public.community_idea_votes;

CREATE POLICY "idea_votes_select_open_or_own"
ON public.community_idea_votes FOR SELECT
USING (
  -- El voto propio, siempre.
  user_id = (select auth.uid())
  OR public.is_admin()
  -- Votos de terceros: solo en ideas abiertas y para sesiones reales.
  OR (
    (select auth.uid()) IS NOT NULL
    AND ((select auth.jwt())->>'is_anonymous')::boolean IS NOT TRUE
    AND EXISTS (
      SELECT 1
      FROM public.community_ideas i
      WHERE i.id = community_idea_votes.idea_id
        AND i.status = 'open'
    )
  )
);

-- La subconsulta EXISTS filtra por community_ideas.status en cada evaluacion.
-- idx_community_ideas_status (csh_s2_27) cubre ese filtro, y la PK
-- (idea_id, user_id) cubre el lookup por idea_id, asi que no hace falta indice
-- nuevo.

COMMENT ON POLICY "idea_votes_select_open_or_own" ON public.community_idea_votes IS
  'Voto propio siempre; votos de terceros solo en ideas abiertas y para sesiones autenticadas no anonimas.';

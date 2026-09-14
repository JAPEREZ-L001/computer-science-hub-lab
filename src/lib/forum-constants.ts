/**
 * Constantes del foro compartidas entre server (community-queries.ts) y
 * cliente (forum-board.tsx). En un archivo propio, sin ningun import de
 * `next/headers` ni de Supabase, para poder importarlas desde un componente
 * 'use client' sin arrastrar codigo server-only al bundle del navegador.
 */
export const FORUM_PAGE_SIZE = 30

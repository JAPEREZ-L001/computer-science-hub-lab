-- CSH-32: Expansión de Base de Datos - Fase 2
-- Añade puntajes, estado de onboarding, comentarios de ideas y proyectos de miembros

-- ==========================================================
-- 1. Modificar perfiles y añadir gamificación básica
-- ==========================================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

-- Para asegurar que los usuarios existentes no queden bloqueados en el onboarding
UPDATE public.profiles SET onboarding_completed = true WHERE updated_at IS NOT NULL;

-- ==========================================================
-- 2. Modificar ideas de comunidad (estado y autor)
-- ==========================================================
-- Creación de roles de ideas
DO $$ BEGIN
  CREATE TYPE public.idea_status AS ENUM ('draft', 'review', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.community_ideas 
  ADD COLUMN IF NOT EXISTS status public.idea_status DEFAULT 'review',
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ==========================================================
-- 3. Crear tabla de comentarios en ideas
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.idea_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.community_ideas(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar RLS en comentarios
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para idea_comments
CREATE POLICY "Public profiles can see idea comments" 
  ON public.idea_comments FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.idea_comments FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
  ON public.idea_comments FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.idea_comments FOR DELETE 
  TO authenticated 
  USING (auth.uid() = author_id);

-- ==========================================================
-- 4. Crear tabla de proyectos de miembros (Portfolio interno)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.member_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  github_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar RLS en proyectos
ALTER TABLE public.member_projects ENABLE ROW LEVEL SECURITY;

-- Políticas para member_projects
CREATE POLICY "Public can view all projects" 
  ON public.member_projects FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Users can create their own projects" 
  ON public.member_projects FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own projects" 
  ON public.member_projects FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.member_projects FOR DELETE 
  TO authenticated 
  USING (auth.uid() = profile_id);

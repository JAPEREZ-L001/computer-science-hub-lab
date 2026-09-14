-- Permite al usuario elegir tema de avatar y banner (índice de paleta 0-9)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_palette_index smallint,
  ADD COLUMN IF NOT EXISTS banner_palette_index smallint;

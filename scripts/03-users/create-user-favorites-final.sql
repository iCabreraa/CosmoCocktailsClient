-- Script para crear la tabla user_favorites
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la tabla user_favorites si no existe
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID NOT NULL,
  cocktail_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, cocktail_id),
  CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_new(id) ON DELETE CASCADE,
  CONSTRAINT user_favorites_cocktail_id_fkey FOREIGN KEY (cocktail_id) REFERENCES public.cocktails(id) ON DELETE CASCADE
);

-- 2. Crear políticas RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios favoritos
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propios favoritos
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_cocktail_id ON public.user_favorites(cocktail_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at);

-- 4. Verificar que se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_favorites'
ORDER BY 
    ordinal_position;

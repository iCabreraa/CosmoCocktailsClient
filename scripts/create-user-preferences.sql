-- Script para crear la tabla user_preferences
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la tabla user_preferences si no existe
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID NOT NULL,
  newsletter BOOLEAN DEFAULT false,
  notifications JSONB DEFAULT '{}'::jsonb,
  language VARCHAR(10) DEFAULT 'es',
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_new(id) ON DELETE CASCADE
);

-- 2. Crear políticas RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias preferencias
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propias preferencias
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar sus propias preferencias
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propias preferencias
CREATE POLICY "Users can delete own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar que se creó correctamente
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
    AND table_name = 'user_preferences'
ORDER BY 
    ordinal_position;

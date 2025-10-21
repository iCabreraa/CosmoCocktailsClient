-- Script para verificar la estructura de user_preferences
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla existe
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

-- 2. Verificar si hay datos
SELECT COUNT(*) as total_preferences FROM public.user_preferences;

-- 3. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    tablename = 'user_preferences';

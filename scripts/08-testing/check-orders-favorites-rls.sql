-- Verificar RLS y politicas para orders y user_favorites
-- Ejecutar en Supabase SQL Editor

-- 1) RLS habilitado
SELECT
  n.nspname AS schema,
  c.relname AS table,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('orders', 'user_favorites')
ORDER BY c.relname;

-- 2) Politicas activas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'user_favorites')
ORDER BY tablename, policyname;

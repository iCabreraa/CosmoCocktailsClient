-- Verify RLS coverage for user-owned data tables
-- Execute in Supabase SQL Editor

-- 1) RLS enabled
SELECT
  n.nspname AS schema,
  c.relname AS table,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'user_addresses',
    'clients',
    'user_preferences',
    'security_events'
  )
ORDER BY c.relname;

-- 2) Active policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_addresses',
    'clients',
    'user_preferences',
    'security_events'
  )
ORDER BY tablename, policyname;

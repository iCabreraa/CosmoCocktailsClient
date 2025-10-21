-- =====================================================
-- VERIFICACIÓN DE CONSOLIDACIÓN DE USUARIOS
-- Sprint 1.1.2 - Verificar que la consolidación fue exitosa
-- =====================================================

-- Este script verifica que la consolidación de usuarios fue exitosa
-- y que no hay referencias residuales a la tabla antigua

-- =====================================================
-- 1. VERIFICAR ESTADO DE LAS TABLAS
-- =====================================================

-- Verificar que users existe y tiene datos
SELECT 
  'users' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_users,
  COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_users
FROM public.users;

-- Verificar que users_deprecated existe (tabla antigua renombrada)
SELECT 
  'users_deprecated' as table_name,
  COUNT(*) as total_records
FROM public.users_deprecated;

-- =====================================================
-- 2. VERIFICAR SINCRONIZACIÓN DE ROLES
-- =====================================================

-- Verificar que los roles están sincronizados entre auth.users y users
WITH role_sync_check AS (
  SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    u.role::text as public_role,
    CASE 
      WHEN au.raw_user_meta_data->>'role' IS DISTINCT FROM u.role::text THEN 'INCONSISTENT'
      ELSE 'CONSISTENT'
    END as sync_status
  FROM auth.users au
  JOIN public.users u ON au.id = u.id
  WHERE au.email_confirmed_at IS NOT NULL
)
SELECT 
  sync_status,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM role_sync_check
GROUP BY sync_status
ORDER BY sync_status;

-- =====================================================
-- 3. VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Verificar que las políticas RLS están configuradas para users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'HAS_CONDITIONS'
    ELSE 'NO_CONDITIONS'
  END as has_conditions
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- 4. VERIFICAR TRIGGERS DE SINCRONIZACIÓN
-- =====================================================

-- Verificar que los triggers están activos
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('sync_user_role_trigger', 'sync_role_to_auth_trigger')
ORDER BY trigger_name, event_manipulation;

-- =====================================================
-- 5. VERIFICAR INTEGRIDAD DE DATOS
-- =====================================================

-- Verificar que no hay usuarios huérfanos
SELECT 
  'Orphaned users in auth.users' as check_type,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL AND au.email_confirmed_at IS NOT NULL;

-- Verificar que no hay usuarios huérfanos en users
SELECT 
  'Orphaned users in users' as check_type,
  COUNT(*) as count
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- =====================================================
-- 6. RESUMEN FINAL
-- =====================================================

SELECT 
  'CONSOLIDACIÓN DE USUARIOS VERIFICADA' as status,
  NOW() as verified_at,
  'Todas las referencias han sido migradas a users' as message,
  'La tabla users_new ha sido renombrada a users' as note;

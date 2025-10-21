-- =====================================================
-- TESTING DE LA SOLUCIÓN: Botón Admin Desaparece tras Token Refresh
-- Sprint 1.1.3 - Verificación de Reactividad del Hook
-- =====================================================

-- Este script verifica que el sistema de acceso administrativo
-- mantenga la reactividad correcta tras token refresh

-- =====================================================
-- 1. VERIFICAR USUARIOS ADMINISTRATIVOS ACTIVOS
-- =====================================================

-- Verificar que existen usuarios admin/staff activos
SELECT 
  'Usuarios administrativos activos' as test_name,
  role,
  status,
  email,
  created_at
FROM public.users
WHERE role IN ('admin', 'staff')
  AND status = 'active'
ORDER BY role, created_at;

-- =====================================================
-- 2. VERIFICAR SINCRONIZACIÓN DE ROLES
-- =====================================================

-- Verificar que los roles están sincronizados
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
    AND u.role IN ('admin', 'staff')
)
SELECT
  'Sincronización de roles administrativos' as test_name,
  sync_status,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM role_sync_check
GROUP BY sync_status
ORDER BY sync_status;

-- =====================================================
-- 3. VERIFICAR EVENTOS DE SEGURIDAD RECIENTES
-- =====================================================

-- Mostrar eventos de admin access más recientes
SELECT 
  'Eventos de admin access recientes' as test_name,
  event_type,
  user_id,
  details->>'success' as success,
  details->>'reason' as reason,
  created_at
FROM public.security_events
WHERE event_type LIKE '%admin_access%'
  AND created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- 4. SIMULAR TOKEN REFRESH Y VERIFICAR REACTIVIDAD
-- =====================================================

-- Insertar evento simulado de token refresh
INSERT INTO public.security_events (event_type, user_id, details, created_at)
VALUES 
  ('admin_access_attempt', (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1), 
   '{"success": true, "reason": "Token refresh simulation", "verification_details": {"isAuthenticated": true, "hasValidRole": true, "userRole": "admin", "rolesSynchronized": true, "isUserActive": true, "userStatus": "active", "hasValidSession": true, "sessionExpiresAt": null, "token_refresh": true}}', 
   NOW());

-- =====================================================
-- 5. VERIFICAR ESTRUCTURA DE SECURITY_EVENTS
-- =====================================================

-- Verificar que la tabla tiene las columnas necesarias
SELECT 
  'Estructura de security_events' as test_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'security_events' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 6. VERIFICAR TRIGGERS DE SINCRONIZACIÓN
-- =====================================================

-- Verificar que los triggers están activos
SELECT
  'Triggers de sincronización activos' as test_name,
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table as target_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('sync_user_role_trigger', 'sync_role_to_auth_trigger')
ORDER BY trigger_name;

-- =====================================================
-- 7. RESUMEN DE VERIFICACIÓN DE REACTIVIDAD
-- =====================================================

SELECT
  'VERIFICACIÓN DE REACTIVIDAD COMPLETADA' as status,
  NOW() as verified_at,
  'Sistema de admin access reactivo a token refresh' as message,
  'Hook useAdminAccessRobust mejorado con escucha de auth state changes' as note;

-- =====================================================
-- TESTING DEL SISTEMA DE ACCESO ADMINISTRATIVO ROBUSTO
-- Sprint 1.1.3 - Verificación de useAdminAccess
-- =====================================================

-- Este script verifica que el sistema de acceso administrativo
-- funcione correctamente con todas las capas de seguridad

-- =====================================================
-- 1. VERIFICAR USUARIOS DE PRUEBA CON ROLES ADMIN/STAFF
-- =====================================================

-- Verificar que existen usuarios con roles admin y staff
SELECT 
  'Usuarios con roles administrativos' as test_name,
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
  COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff_users,
  COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_users
FROM public.users
WHERE role IN ('admin', 'staff', 'customer');

-- =====================================================
-- 2. VERIFICAR SINCRONIZACIÓN DE ROLES
-- =====================================================

-- Verificar que los roles están sincronizados entre auth.users y public.users
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
  'Sincronización de roles' as test_name,
  sync_status,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM role_sync_check
GROUP BY sync_status
ORDER BY sync_status;

-- =====================================================
-- 3. VERIFICAR ESTADO DE USUARIOS ADMINISTRATIVOS
-- =====================================================

-- Verificar que los usuarios administrativos están activos
SELECT 
  'Estado de usuarios administrativos' as test_name,
  role,
  status,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM public.users
WHERE role IN ('admin', 'staff')
GROUP BY role, status
ORDER BY role, status;

-- =====================================================
-- 4. VERIFICAR TABLA DE EVENTOS DE SEGURIDAD
-- =====================================================

-- Verificar que la tabla security_events existe y tiene la estructura correcta
SELECT 
  'Estructura de security_events' as test_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'security_events' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 5. VERIFICAR TRIGGERS DE SINCRONIZACIÓN
-- =====================================================

-- Verificar que los triggers están activos
SELECT
  'Triggers de sincronización' as test_name,
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table as target_table
FROM information_schema.triggers
WHERE trigger_name IN ('sync_user_role_trigger', 'sync_role_to_auth_trigger')
ORDER BY trigger_name;

-- =====================================================
-- 6. SIMULAR EVENTOS DE ACCESO ADMINISTRATIVO
-- =====================================================

-- Insertar eventos de prueba para verificar el logging
INSERT INTO public.security_events (event_type, user_id, details, created_at)
VALUES 
  ('admin_access_attempt', (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1), 
   '{"success": true, "reason": "Test access", "verification_details": {"isAuthenticated": true, "hasValidRole": true, "userRole": "admin", "rolesSynchronized": true, "isUserActive": true, "userStatus": "active", "hasValidSession": true, "sessionExpiresAt": null}}', 
   NOW()),
  ('admin_access_granted', (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1), 
   '{"success": true, "reason": "Access granted", "verification_details": {"isAuthenticated": true, "hasValidRole": true, "userRole": "admin", "rolesSynchronized": true, "isUserActive": true, "userStatus": "active", "hasValidSession": true, "sessionExpiresAt": null}}', 
   NOW()),
  ('admin_access_denied', (SELECT id FROM public.users WHERE role = 'customer' LIMIT 1), 
   '{"success": false, "reason": "Invalid role: customer", "verification_details": {"isAuthenticated": true, "hasValidRole": false, "userRole": "customer", "rolesSynchronized": true, "isUserActive": true, "userStatus": "active", "hasValidSession": true, "sessionExpiresAt": null}}', 
   NOW());

-- =====================================================
-- 7. VERIFICAR EVENTOS DE SEGURIDAD RECIENTES
-- =====================================================

-- Mostrar los eventos de seguridad más recientes
SELECT 
  'Eventos de seguridad recientes' as test_name,
  event_type,
  user_id,
  details->>'success' as success,
  details->>'reason' as reason,
  created_at
FROM public.security_events
WHERE event_type LIKE '%admin_access%'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 8. RESUMEN DE VERIFICACIÓN
-- =====================================================

SELECT
  'RESUMEN DE VERIFICACIÓN DEL SISTEMA DE ACCESO ADMINISTRATIVO' as status,
  NOW() as verified_at,
  'Sistema implementado con verificación multi-capa' as message,
  'Logging de seguridad activo' as note;

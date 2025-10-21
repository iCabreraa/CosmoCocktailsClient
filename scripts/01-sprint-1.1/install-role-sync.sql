-- =====================================================
-- INSTALACIÓN COMPLETA DEL SISTEMA DE ROLES UNIFICADO
-- Sprint 1.1.1 - Unificar Sistema de Roles
-- =====================================================

-- Este script ejecuta todos los pasos necesarios para implementar
-- la sincronización automática de roles entre auth.users y public.users_new

-- IMPORTANTE: Ejecutar en este orden exacto

-- =====================================================
-- PASO 1: Verificar prerequisitos y crear tablas necesarias
-- =====================================================

-- Verificar que las tablas existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_new' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Tabla public.users_new no existe. Ejecutar primero la migración de base de datos.';
  END IF;
  
  RAISE NOTICE '✅ Tabla users_new verificada';
END $$;

-- Crear tabla security_events si no existe
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

-- Verificar que se creó correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_events' AND table_schema = 'public') THEN
    RAISE NOTICE '✅ Tabla security_events creada/verificada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error creando tabla security_events';
  END IF;
END $$;

-- =====================================================
-- PASO 2: Crear triggers de sincronización
-- =====================================================

-- Ejecutar el script de triggers
\i scripts/sync-roles-trigger.sql

-- =====================================================
-- PASO 3: Migrar roles existentes
-- =====================================================

-- Ejecutar el script de migración
\i scripts/migrate-existing-roles.sql

-- =====================================================
-- PASO 4: Ejecutar tests de integración
-- =====================================================

-- Ejecutar los tests
\i scripts/test-role-sync.sql

-- =====================================================
-- PASO 5: Verificación final
-- =====================================================

-- Verificar que los triggers están activos
SELECT 
  'TRIGGER STATUS' as check_type,
  trigger_name,
  event_manipulation,
  action_timing,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ ACTIVE'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.triggers 
WHERE trigger_name IN ('sync_user_role_trigger', 'sync_role_to_auth_trigger')
ORDER BY trigger_name;

-- Verificar sincronización actual
WITH sync_check AS (
  SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    un.role::text as public_role,
    CASE 
      WHEN au.raw_user_meta_data->>'role' IS DISTINCT FROM un.role::text THEN 'INCONSISTENT'
      WHEN au.raw_user_meta_data->>'role' IS NULL AND un.role IS NULL THEN 'BOTH_NULL'
      WHEN au.raw_user_meta_data->>'role' IS NULL THEN 'AUTH_NULL'
      WHEN un.role IS NULL THEN 'PUBLIC_NULL'
      ELSE 'CONSISTENT'
    END as status
  FROM auth.users au
  LEFT JOIN public.users_new un ON au.id = un.id
  WHERE au.email_confirmed_at IS NOT NULL
)
SELECT 
  'SYNC STATUS' as check_type,
  status,
  COUNT(*) as count,
  CASE 
    WHEN status = 'CONSISTENT' THEN '✅ Perfecto'
    WHEN status = 'BOTH_NULL' THEN '⚠️ Usuarios sin rol'
    ELSE '❌ Requiere atención'
  END as message
FROM sync_check
GROUP BY status
ORDER BY status;

-- Mostrar usuarios inconsistentes (si los hay)
WITH inconsistent_users AS (
  SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    un.role::text as public_role
  FROM auth.users au
  JOIN public.users_new un ON au.id = un.id
  WHERE au.email_confirmed_at IS NOT NULL
    AND au.raw_user_meta_data->>'role' IS DISTINCT FROM un.role::text
)
SELECT 
  'INCONSISTENT USERS' as alert,
  email,
  auth_role,
  public_role
FROM inconsistent_users
ORDER BY email;

-- =====================================================
-- PASO 6: Documentación de uso
-- =====================================================

SELECT 
  'INSTALLATION COMPLETE' as status,
  'Sistema de roles unificado instalado correctamente' as message,
  'Los triggers mantendrán automáticamente la sincronización' as note_1,
  'Usar UserRepository.updateRole() para cambios de rol' as note_2,
  'Todos los cambios se registran en security_events' as note_3,
  NOW() as completed_at;

-- =====================================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- =====================================================

/*
INSTRUCCIONES PARA EL DESARROLLADOR:

1. ACTUALIZAR CÓDIGO:
   - El endpoint /api/signup ya está actualizado para usar Supabase Auth
   - UserRepository.updateRole() ya incluye logging de auditoría
   - Los triggers se encargan de la sincronización automática

2. TESTING:
   - Ejecutar: npm run test (cuando estén implementados los tests unitarios)
   - Verificar en Supabase Dashboard que los triggers están activos
   - Probar cambios de rol desde el panel de administración

3. MONITOREO:
   - Revisar tabla security_events para eventos de sincronización
   - Monitorear logs de aplicación para errores de sincronización
   - Verificar consistencia periódicamente con el script de verificación

4. MANTENIMIENTO:
   - Los triggers se ejecutan automáticamente
   - No requiere intervención manual para sincronización
   - En caso de problemas, ejecutar scripts/migrate-existing-roles.sql

5. ROLLBACK (si es necesario):
   DROP TRIGGER IF EXISTS sync_user_role_trigger ON auth.users;
   DROP TRIGGER IF EXISTS sync_role_to_auth_trigger ON public.users_new;
   DROP FUNCTION IF EXISTS sync_user_role();
   DROP FUNCTION IF EXISTS sync_role_to_auth();
*/

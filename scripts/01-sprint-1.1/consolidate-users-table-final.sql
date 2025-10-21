-- =====================================================
-- CONSOLIDACIÓN FINAL DE TABLA DE USUARIOS
-- Sprint 1.1.2 - Consolidar tabla de usuarios
-- =====================================================

-- Este script migra datos de public.users (antigua) a public.users_new (nueva)
-- y luego renombra users_new a users (nombre definitivo)

BEGIN;

-- =====================================================
-- 1. AUDITORÍA INICIAL: Verificar estado actual
-- =====================================================

-- Verificar que no hay datos importantes en public.users que no estén en users_new
WITH missing_users AS (
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at
  FROM public.users u
  LEFT JOIN public.users_new un ON u.id = un.id
  WHERE un.id IS NULL
)
SELECT 
  COUNT(*) as missing_count,
  STRING_AGG(email, ', ') as missing_emails
FROM missing_users;

-- =====================================================
-- 2. MIGRACIÓN FINAL: Mover datos faltantes (si los hay)
-- =====================================================

-- Insertar usuarios que existan en public.users pero no en users_new
-- NOTA: public.users NO tiene columnas preferences, metadata, status
-- Solo tiene: id, full_name, email, phone, created_at, avatar_url, role, password
INSERT INTO public.users_new (
  id,
  email,
  full_name,
  phone,
  avatar_url,
  role,
  status,
  preferences,
  metadata,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.avatar_url,
  COALESCE(u.role::user_role, 'customer'),
  'active'::user_status,  -- Valor por defecto ya que public.users no tiene status
  '{}'::jsonb,            -- Valor por defecto ya que public.users no tiene preferences
  '{}'::jsonb,            -- Valor por defecto ya que public.users no tiene metadata
  u.created_at,
  u.created_at            -- Usar created_at como updated_at inicial
FROM public.users u
LEFT JOIN public.users_new un ON u.id = un.id
WHERE un.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. VERIFICACIÓN: Confirmar que todos los datos están migrados
-- =====================================================

-- Verificar que no hay usuarios en public.users que no estén en users_new
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ MIGRACIÓN COMPLETA: Todos los usuarios están en users_new'
    ELSE '❌ MIGRACIÓN INCOMPLETA: ' || COUNT(*) || ' usuarios faltan en users_new'
  END as migration_status
FROM public.users u
LEFT JOIN public.users_new un ON u.id = un.id
WHERE un.id IS NULL;

-- =====================================================
-- 4. RENOMBRAR TABLAS PARA NOMENCLATURA CORRECTA
-- =====================================================

-- Paso 1: Renombrar tabla antigua para liberar el nombre
ALTER TABLE public.users RENAME TO users_deprecated;

-- Paso 2: Renombrar users_new a users (nombre definitivo)
ALTER TABLE public.users_new RENAME TO users;

-- Comentar la tabla deprecada
COMMENT ON TABLE public.users_deprecated IS 'TABLA DEPRECADA - Usar public.users en su lugar. Esta tabla se mantiene solo para referencia histórica.';

-- Comentar la tabla definitiva
COMMENT ON TABLE public.users IS 'TABLA PRINCIPAL DE USUARIOS - Perfiles de usuario sincronizados con auth.users';

-- =====================================================
-- 5. VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar resumen de la consolidación
SELECT 
  'CONSOLIDACIÓN COMPLETADA' as status,
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.users_deprecated) as total_users_deprecated,
  'Tabla users es ahora la única tabla de usuarios activa' as message;

-- Verificar que las políticas RLS están en users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

COMMIT;

-- =====================================================
-- NOTAS POST-EJECUCIÓN
-- =====================================================

-- 1. La tabla public.users_new ha sido renombrada a public.users
-- 2. La tabla public.users antigua ha sido renombrada a public.users_deprecated
-- 3. Todas las referencias en el código han sido actualizadas a public.users
-- 4. Las políticas RLS están configuradas para public.users
-- 5. Los triggers de sincronización de roles funcionan con users
-- 6. La tabla deprecada se puede eliminar en el futuro si se confirma que no se necesita

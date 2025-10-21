-- =====================================================
-- TESTS DE INTEGRACIÓN PARA SINCRONIZACIÓN DE ROLES
-- Sprint 1.1.1 - Unificar Sistema de Roles
-- =====================================================

-- Este script contiene tests para verificar que la sincronización de roles funciona correctamente
-- Ejecutar DESPUÉS de crear los triggers y ejecutar la migración

-- =====================================================
-- TEST 1: Sincronización Auth.users -> Public.users_new
-- =====================================================

-- Crear usuario de prueba en auth.users
DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test-sync-1@cosmococktails.com';
BEGIN
  -- Limpiar datos de prueba anteriores
  DELETE FROM public.security_events WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = test_email
  );
  DELETE FROM public.users_new WHERE email = test_email;
  DELETE FROM auth.users WHERE email = test_email;
  
  -- Crear usuario en auth.users con rol
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt('test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "full_name": "Test Sync User 1", "phone": "+31 111111111"}',
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO test_user_id;
  
  -- Verificar que se creó en users_new automáticamente
  IF EXISTS (
    SELECT 1 FROM public.users_new 
    WHERE id = test_user_id AND role = 'admin'::user_role
  ) THEN
    RAISE NOTICE '✅ TEST 1 PASSED: User created in users_new with correct role';
  ELSE
    RAISE NOTICE '❌ TEST 1 FAILED: User not found in users_new or incorrect role';
  END IF;
  
  -- Limpiar datos de prueba
  DELETE FROM public.security_events WHERE user_id = test_user_id;
  DELETE FROM public.users_new WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- =====================================================
-- TEST 2: Sincronización Public.users_new -> Auth.users
-- =====================================================

DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test-sync-2@cosmococktails.com';
BEGIN
  -- Limpiar datos de prueba anteriores
  DELETE FROM public.security_events WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = test_email
  );
  DELETE FROM public.users_new WHERE email = test_email;
  DELETE FROM auth.users WHERE email = test_email;
  
  -- Crear usuario en auth.users sin rol específico
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt('test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test Sync User 2", "phone": "+31 222222222"}',
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO test_user_id;
  
  -- Actualizar el perfil existente en users_new con rol staff
  -- (el trigger ya lo creó automáticamente)
  UPDATE public.users_new 
  SET 
    role = 'staff'::user_role,
    full_name = 'Test Sync User 2',
    phone = '+31 222222222',
    updated_at = NOW()
  WHERE id = test_user_id;
  
  -- Verificar que se actualizó en auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = test_user_id AND raw_user_meta_data->>'role' = 'staff'
  ) THEN
    RAISE NOTICE '✅ TEST 2 PASSED: Role updated in auth.users';
  ELSE
    RAISE NOTICE '❌ TEST 2 FAILED: Role not updated in auth.users';
  END IF;
  
  -- Limpiar datos de prueba
  DELETE FROM public.security_events WHERE user_id = test_user_id;
  DELETE FROM public.users_new WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- =====================================================
-- TEST 3: Cambio de rol bidireccional
-- =====================================================

DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test-sync-3@cosmococktails.com';
BEGIN
  -- Limpiar datos de prueba anteriores
  DELETE FROM public.security_events WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = test_email
  );
  DELETE FROM public.users_new WHERE email = test_email;
  DELETE FROM auth.users WHERE email = test_email;
  
  -- Crear usuario completo
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt('test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "customer", "full_name": "Test Sync User 3", "phone": "+31 333333333"}',
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO test_user_id;
  
  -- Cambiar rol en auth.users
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
  WHERE id = test_user_id;
  
  -- Verificar que se actualizó en users_new
  IF EXISTS (
    SELECT 1 FROM public.users_new 
    WHERE id = test_user_id AND role = 'admin'::user_role
  ) THEN
    RAISE NOTICE '✅ TEST 3A PASSED: Role change auth->public synchronized';
  ELSE
    RAISE NOTICE '❌ TEST 3A FAILED: Role change auth->public not synchronized';
  END IF;
  
  -- Cambiar rol en users_new
  UPDATE public.users_new 
  SET role = 'staff'::user_role
  WHERE id = test_user_id;
  
  -- Verificar que se actualizó en auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = test_user_id AND raw_user_meta_data->>'role' = 'staff'
  ) THEN
    RAISE NOTICE '✅ TEST 3B PASSED: Role change public->auth synchronized';
  ELSE
    RAISE NOTICE '❌ TEST 3B FAILED: Role change public->auth not synchronized';
  END IF;
  
  -- Limpiar datos de prueba
  DELETE FROM public.security_events WHERE user_id = test_user_id;
  DELETE FROM public.users_new WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- =====================================================
-- TEST 4: Verificar logs de auditoría
-- =====================================================

DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT := 'test-sync-4@cosmococktails.com';
  event_count INTEGER;
BEGIN
  -- Limpiar datos de prueba anteriores
  DELETE FROM public.security_events WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = test_email
  );
  DELETE FROM public.users_new WHERE email = test_email;
  DELETE FROM auth.users WHERE email = test_email;
  DELETE FROM public.security_events WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = test_email
  );
  
  -- Crear usuario
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    test_email,
    crypt('test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "customer", "full_name": "Test Sync User 4", "phone": "+31 444444444"}',
    false,
    '',
    '',
    '',
    ''
  ) RETURNING id INTO test_user_id;
  
  -- Cambiar rol para generar evento
  UPDATE public.users_new 
  SET role = 'admin'::user_role
  WHERE id = test_user_id;
  
  -- Verificar que se creó el evento de auditoría
  SELECT COUNT(*) INTO event_count
  FROM public.security_events 
  WHERE user_id = test_user_id AND event_type = 'role_sync';
  
  IF event_count > 0 THEN
    RAISE NOTICE '✅ TEST 4 PASSED: Audit events created correctly';
  ELSE
    RAISE NOTICE '❌ TEST 4 FAILED: No audit events found';
  END IF;
  
  -- Limpiar datos de prueba
  DELETE FROM public.security_events WHERE user_id = test_user_id;
  DELETE FROM public.users_new WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
  DELETE FROM public.security_events WHERE user_id = test_user_id;
END $$;

-- =====================================================
-- RESUMEN DE TESTS
-- =====================================================

SELECT 
  'INTEGRATION TESTS SUMMARY' as summary,
  'All tests completed. Check the notices above for results.' as message,
  NOW() as completed_at;

-- Mostrar estado actual de sincronización
WITH sync_status AS (
  SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    un.role::text as public_role,
    CASE 
      WHEN au.raw_user_meta_data->>'role' IS DISTINCT FROM un.role::text THEN 'INCONSISTENT'
      ELSE 'CONSISTENT'
    END as status
  FROM auth.users au
  LEFT JOIN public.users_new un ON au.id = un.id
  WHERE au.email_confirmed_at IS NOT NULL
    AND au.email LIKE '%cosmococktails.com'
)
SELECT 
  status,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM sync_status
GROUP BY status
ORDER BY status;

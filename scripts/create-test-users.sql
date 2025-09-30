-- Script para crear usuarios de prueba completamente nuevos y consistentes
-- Ejecutar en Supabase SQL Editor

-- 1. Limpiar usuarios de prueba existentes (OPCIONAL - solo si quieres empezar limpio)
-- DELETE FROM auth.users WHERE email IN ('test-admin@cosmococktails.com', 'test-staff@cosmococktails.com', 'test-customer@cosmococktails.com');
-- DELETE FROM public.users WHERE email IN ('test-admin@cosmococktails.com', 'test-staff@cosmococktails.com', 'test-customer@cosmococktails.com');

-- 2. Crear usuario ADMIN de prueba
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
    'test-admin@cosmococktails.com',
    crypt('admin123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "full_name": "Test Admin", "phone": "+31 123456789"}',
    false,
    '',
    '',
    '',
    ''
);

-- 3. Crear usuario STAFF de prueba
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
    'test-staff@cosmococktails.com',
    crypt('staff123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "staff", "full_name": "Test Staff", "phone": "+31 987654321"}',
    false,
    '',
    '',
    '',
    ''
);

-- 4. Crear usuario CUSTOMER de prueba
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
    'test-customer@cosmococktails.com',
    crypt('customer123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "customer", "full_name": "Test Customer", "phone": "+31 555666777"}',
    false,
    '',
    '',
    '',
    ''
);

-- 5. Obtener los IDs de los usuarios creados
WITH user_ids AS (
    SELECT 
        id,
        email,
        raw_user_meta_data->>'role' as role,
        raw_user_meta_data->>'full_name' as full_name,
        raw_user_meta_data->>'phone' as phone
    FROM auth.users 
    WHERE email IN ('test-admin@cosmococktails.com', 'test-staff@cosmococktails.com', 'test-customer@cosmococktails.com')
)
-- 6. Crear perfiles en public.users para que el e-commerce funcione
INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    created_at,
    updated_at
)
SELECT 
    ui.id,
    ui.email,
    ui.full_name,
    ui.phone,
    CASE 
        WHEN ui.role = 'admin' THEN 'admin'
        WHEN ui.role = 'staff' THEN 'staff'
        ELSE 'client'
    END as role,
    NOW() as created_at,
    NOW() as updated_at
FROM user_ids ui;

-- 7. Verificar que todo se creó correctamente
SELECT 
    'AUTH USERS' as source,
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    au.raw_user_meta_data->>'full_name' as full_name
FROM auth.users au
WHERE au.email IN ('test-admin@cosmococktails.com', 'test-staff@cosmococktails.com', 'test-customer@cosmococktails.com')

UNION ALL

SELECT 
    'PUBLIC USERS' as source,
    pu.email,
    pu.role as public_role,
    pu.full_name
FROM public.users pu
WHERE pu.email IN ('test-admin@cosmococktails.com', 'test-staff@cosmococktails.com', 'test-customer@cosmococktails.com')

ORDER BY email, source;

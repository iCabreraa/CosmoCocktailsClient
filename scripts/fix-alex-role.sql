-- Script específico para añadir el rol admin a alexaliaman9@gmail.com
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar que el usuario existe en public.users
SELECT id, email, role 
FROM public.users 
WHERE email = 'alexaliaman9@gmail.com';

-- 2. Actualizar user_metadata en auth.users para añadir el rol
UPDATE auth.users 
SET 
    raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb,
    updated_at = NOW()
WHERE email = 'alexaliaman9@gmail.com';

-- 3. Verificar el resultado
SELECT 
    email,
    raw_user_meta_data->>'role' as role_in_metadata,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'alexaliaman9@gmail.com';

-- 4. También verificar en public.users
SELECT 
    u.email,
    u.role as role_in_public_users,
    au.raw_user_meta_data->>'role' as role_in_auth_metadata
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'alexaliaman9@gmail.com';


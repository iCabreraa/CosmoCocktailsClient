-- Insertar usuarios de prueba directamente en Supabase
-- Ejecutar en Supabase SQL Editor

-- 1. Insertar admin de prueba
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@cosmococktails.com',
  crypt('admin123456', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin Cosmococktails", "phone": "+31 654321987", "role": "admin", "avatar_url": "https://i.pravatar.cc/300?img=15"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 2. Insertar cliente de prueba
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@cosmococktails.com',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Usuario de Prueba", "phone": "+31 612345678", "role": "client", "avatar_url": "https://i.pravatar.cc/300?img=1"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 3. Insertar staff de prueba
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'staff@cosmococktails.com',
  crypt('staff123456', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Staff Cosmococktails", "phone": "+31 612345679", "role": "staff", "avatar_url": "https://i.pravatar.cc/300?img=2"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 4. Verificar que los usuarios se crearon correctamente
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users 
WHERE email IN (
  'admin@cosmococktails.com',
  'test@cosmococktails.com',
  'staff@cosmococktails.com'
);

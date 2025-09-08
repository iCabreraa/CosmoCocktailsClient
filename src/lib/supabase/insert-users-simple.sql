-- Script simple para crear usuarios de prueba
-- Ejecutar en Supabase SQL Editor

-- Crear usuarios usando la función de Supabase
-- Nota: Este script debe ejecutarse con permisos de administrador

-- 1. Crear admin
SELECT auth.users.create_user(
  'admin@cosmococktails.com',
  'admin123456',
  '{"full_name": "Admin Cosmococktails", "phone": "+31 654321987", "role": "admin", "avatar_url": "https://i.pravatar.cc/300?img=15"}'
);

-- 2. Crear cliente
SELECT auth.users.create_user(
  'test@cosmococktails.com',
  'test123456',
  '{"full_name": "Usuario de Prueba", "phone": "+31 612345678", "role": "client", "avatar_url": "https://i.pravatar.cc/300?img=1"}'
);

-- 3. Crear staff
SELECT auth.users.create_user(
  'staff@cosmococktails.com',
  'staff123456',
  '{"full_name": "Staff Cosmococktails", "phone": "+31 612345679", "role": "staff", "avatar_url": "https://i.pravatar.cc/300?img=2"}'
);

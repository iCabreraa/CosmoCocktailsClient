-- Script para corregir foreign key de orders de users a users_new
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar la foreign key constraint existente
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- 2. Modificar la columna user_id para que permita NULL (para guest users)
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Crear nueva foreign key constraint que apunte a users_new
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users_new(id) ON DELETE CASCADE;

-- 4. Verificar que la constraint se creó correctamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='orders' 
  AND kcu.column_name='user_id';

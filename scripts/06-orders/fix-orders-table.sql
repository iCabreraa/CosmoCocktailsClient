-- Script para corregir la tabla orders en Supabase
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- 1. Agregar columna payment_intent_id
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- 2. Agregar columna shipping_address
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- 3. Agregar columna created_at si no existe
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Agregar columna updated_at si no existe
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

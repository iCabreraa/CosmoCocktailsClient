-- Script completo para corregir el esquema de la base de datos
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- 1. Corregir tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Corregir tabla order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);

-- 3. Verificar estructura de orders
SELECT 'ORDERS TABLE:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 4. Verificar estructura de order_items
SELECT 'ORDER_ITEMS TABLE:' as table_name;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

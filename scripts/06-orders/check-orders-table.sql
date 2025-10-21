-- Verificar estructura de la tabla orders
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Agregar columna payment_intent_id si no existe
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

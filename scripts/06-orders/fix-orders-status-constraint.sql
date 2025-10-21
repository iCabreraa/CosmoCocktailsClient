-- Script para corregir la restricción de estado en la tabla orders
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- 1. Verificar las restricciones actuales en la tabla orders
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'orders' 
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_name;

-- 2. Eliminar la restricción de estado existente si existe
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- 3. Crear nueva restricción que permita nuestros estados
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('ordered', 'paid', 'preparing', 'on_the_way', 'completed', 'pending', 'cancelled'));

-- 4. Verificar que la nueva restricción se creó correctamente
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'orders' 
    AND tc.table_schema = 'public'
    AND tc.constraint_name = 'orders_status_check';

-- 5. Probar insertar un pedido con estado 'ordered'
INSERT INTO public.orders (total_amount, status, payment_intent_id)
VALUES (10.00, 'ordered', 'test_payment_intent_' || extract(epoch from now()))
RETURNING id, status;

-- 6. Limpiar el registro de prueba
DELETE FROM public.orders WHERE payment_intent_id LIKE 'test_payment_intent_%';


-- Script de diagnóstico para verificar el estado actual de la base de datos
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- 1. Verificar qué estados existen actualmente en la tabla orders
SELECT status, COUNT(*) as count
FROM public.orders 
GROUP BY status
ORDER BY status;

-- 2. Verificar la restricción CHECK actual
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

-- 3. Verificar si el RPC existe y qué hace
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'decrement_stock_and_create_order'
    AND routine_schema = 'public';

-- 4. Intentar insertar un pedido de prueba con estado "ordered"
INSERT INTO public.orders (total_amount, status, is_paid, payment_intent_id, order_ref)
VALUES (10.00, 'ordered', true, 'test_diagnostic', 'CC-TEST-001')
RETURNING id, status;

-- 5. Limpiar el registro de prueba
DELETE FROM public.orders WHERE payment_intent_id = 'test_diagnostic';


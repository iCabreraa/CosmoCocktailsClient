-- Script de diagnóstico para el pedido específico
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- 1. Buscar el pedido específico por ID
SELECT 
    id, 
    order_ref, 
    status, 
    total_amount, 
    is_paid, 
    payment_intent_id,
    user_id,
    created_at
FROM public.orders 
WHERE id = '981deea0-3e2b-4d90-a21c-f3a3d06a62e6';

-- 2. Buscar por order_ref si el ID no funciona
SELECT 
    id, 
    order_ref, 
    status, 
    total_amount, 
    is_paid, 
    payment_intent_id,
    user_id,
    created_at
FROM public.orders 
WHERE order_ref LIKE '%981deea0%';

-- 3. Ver todos los pedidos recientes
SELECT 
    id, 
    order_ref, 
    status, 
    total_amount, 
    is_paid, 
    payment_intent_id,
    user_id,
    created_at
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Verificar si hay problemas con la relación users
SELECT 
    o.id, 
    o.order_ref, 
    o.status, 
    o.user_id,
    u.name,
    u.email
FROM public.orders o
LEFT JOIN public.users u ON o.user_id = u.id
WHERE o.id = '981deea0-3e2b-4d90-a21c-f3a3d06a62e6';

-- 5. Verificar los items del pedido
SELECT 
    oi.order_id,
    oi.cocktail_id,
    oi.size_id,
    oi.quantity,
    oi.unit_price,
    oi.item_total,
    c.name as cocktail_name,
    c.image_url as cocktail_image,
    s.name as size_name
FROM public.order_items oi
LEFT JOIN public.cocktails c ON oi.cocktail_id = c.id
LEFT JOIN public.sizes s ON oi.size_id = s.id
WHERE oi.order_id = '981deea0-3e2b-4d90-a21c-f3a3d06a62e6';


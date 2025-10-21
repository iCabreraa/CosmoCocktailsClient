-- Script actualizado para corregir la restricción de estado en la tabla orders
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

-- 3. Crear nueva restricción que permita nuestros estados (orden lógico)
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('paid', 'ordered', 'preparing', 'on_the_way', 'completed', 'pending', 'cancelled'));

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

-- 5. Actualizar el RPC para crear pedidos con estado 'paid'
CREATE OR REPLACE FUNCTION public.decrement_stock_and_create_order(
  p_payment_intent_id text,
  p_total_amount numeric,
  p_items jsonb  -- array of objects: { cocktail_id: uuid, size_id: uuid, quantity: int, unit_price: numeric }
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id bigint;
  v_order_ref text;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_payment_intent_id, 0));

  IF p_payment_intent_id IS NULL OR p_payment_intent_id = '' THEN
    RAISE EXCEPTION 'payment_intent_id requerido';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'items vacíos';
  END IF;

  -- Ensure enough stock
  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_items)
      AS it(cocktail_id uuid, size_id uuid, quantity int)
    JOIN public.cocktail_sizes cs
      ON cs.cocktail_id = it.cocktail_id
     AND cs.sizes_id = it.size_id
    WHERE cs.stock_quantity < it.quantity
  ) THEN
    RAISE EXCEPTION 'Stock insuficiente para algún item';
  END IF;

  -- Create human-friendly order_ref: CC-YYYYMMDD-<sequence>
  SELECT 'CC-' || to_char(now(),'YYYYMMDD') || '-' || lpad(nextval('order_ref_seq')::text, 6, '0') INTO v_order_ref;

  -- Create paid order (pago confirmado directamente)
  INSERT INTO public.orders (total_amount, status, is_paid, payment_intent_id, order_ref)
  VALUES (p_total_amount, 'paid', true, p_payment_intent_id, v_order_ref)
  RETURNING id INTO v_order_id;

  -- Insert items
  INSERT INTO public.order_items (order_id, cocktail_id, size_id, quantity, unit_price, item_total)
  SELECT
    v_order_id,
    it.cocktail_id,
    it.size_id,
    it.quantity,
    COALESCE(it.unit_price, 0),
    COALESCE(it.unit_price, 0) * it.quantity
  FROM jsonb_to_recordset(p_items)
    AS it(cocktail_id uuid, size_id uuid, quantity int, unit_price numeric);

  -- Decrement stock
  UPDATE public.cocktail_sizes cs
  SET stock_quantity = stock_quantity - it.quantity
  FROM jsonb_to_recordset(p_items)
    AS it(cocktail_id uuid, size_id uuid, quantity int)
  WHERE cs.cocktail_id = it.cocktail_id
    AND cs.sizes_id = it.size_id;
END;
$$;

-- 6. Probar insertar un pedido con estado 'paid'
INSERT INTO public.orders (total_amount, status, payment_intent_id)
VALUES (10.00, 'paid', 'test_payment_intent_' || extract(epoch from now()))
RETURNING id, status;

-- 7. Limpiar el registro de prueba
DELETE FROM public.orders WHERE payment_intent_id LIKE 'test_payment_intent_%';


-- Script simplificado para actualizar la lógica de estados
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- Actualizar el RPC para crear pedidos directamente con estado "ordered" cuando el pago está confirmado
CREATE OR REPLACE FUNCTION public.decrement_stock_and_create_order(
  p_payment_intent_id text,
  p_total_amount numeric,
  p_items jsonb
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

  -- Create order with "ordered" status directly (pago confirmado = pedido procesado)
  INSERT INTO public.orders (total_amount, status, is_paid, payment_intent_id, order_ref)
  VALUES (p_total_amount, 'ordered', true, p_payment_intent_id, v_order_ref)
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

-- Función para cambiar manualmente el estado de un pedido (para testing)
CREATE OR REPLACE FUNCTION public.update_order_status(
  order_id_param uuid,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.orders 
  SET status = new_status
  WHERE id = order_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado: %', order_id_param;
  END IF;
END;
$$;

-- Verificar que todo funciona
SELECT 'RPC actualizado correctamente' as status;


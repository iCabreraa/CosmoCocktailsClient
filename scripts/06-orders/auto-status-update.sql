-- Script para actualizar la lógica de estados automáticos
-- Ejecutar este SQL en el SQL Editor del dashboard de Supabase

-- 1. Crear función para cambiar estado automáticamente
CREATE OR REPLACE FUNCTION public.update_order_status_auto()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cambiar pedidos "paid" a "ordered" después de 30 segundos
  UPDATE public.orders 
  SET status = 'ordered'
  WHERE status = 'paid' 
    AND created_at < NOW() - INTERVAL '30 seconds';
END;
$$;

-- 2. Crear función para programar la actualización automática
CREATE OR REPLACE FUNCTION public.schedule_order_status_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta función se puede llamar desde el webhook o desde un cron job
  PERFORM public.update_order_status_auto();
END;
$$;

-- 3. Actualizar el RPC para crear pedidos con estado "paid" inicialmente
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

  -- Programar cambio automático a "ordered" después de 30 segundos
  PERFORM pg_sleep(30);
  UPDATE public.orders 
  SET status = 'ordered'
  WHERE id = v_order_id AND status = 'paid';
END;
$$;

-- 4. Crear función alternativa más simple para el cambio automático
CREATE OR REPLACE FUNCTION public.auto_update_paid_to_ordered()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si se inserta un pedido con estado "paid", programar cambio a "ordered"
  IF NEW.status = 'paid' THEN
    -- Usar pg_cron si está disponible, o simplemente marcar para procesamiento posterior
    PERFORM public.schedule_order_status_update();
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Crear trigger para cambio automático (opcional)
-- DROP TRIGGER IF EXISTS auto_update_order_status ON public.orders;
-- CREATE TRIGGER auto_update_order_status
--   AFTER INSERT ON public.orders
--   FOR EACH ROW
--   EXECUTE FUNCTION public.auto_update_paid_to_ordered();

-- 6. Función manual para cambiar estados (para testing)
CREATE OR REPLACE FUNCTION public.manual_update_order_status(order_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.orders 
  SET status = 'ordered'
  WHERE id = order_id_param AND status = 'paid';
END;
$$;

-- 7. Verificar que todo funciona
SELECT 'Funciones creadas correctamente' as status;


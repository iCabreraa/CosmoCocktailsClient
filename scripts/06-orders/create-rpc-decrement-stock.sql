-- Create transactional RPC to create a paid order and decrement stock
-- Usage: paste in Supabase SQL editor and run

create or replace function public.decrement_stock_and_create_order(
  p_payment_intent_id text,
  p_total_amount numeric,
  p_items jsonb  -- array of objects: { cocktail_id: uuid, size_id: uuid, quantity: int, unit_price: numeric }
)
returns void
language plpgsql
security definer
as $$
declare
  v_order_id bigint;
  v_order_ref text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_payment_intent_id, 0));

  if p_payment_intent_id is null or p_payment_intent_id = '' then
    raise exception 'payment_intent_id requerido';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'items vacíos';
  end if;

  -- Ensure enough stock
  if exists (
    select 1
    from jsonb_to_recordset(p_items)
      as it(cocktail_id uuid, size_id uuid, quantity int)
    join public.cocktail_sizes cs
      on cs.cocktail_id = it.cocktail_id
     and cs.sizes_id = it.size_id
    where cs.stock_quantity < it.quantity
  ) then
    raise exception 'Stock insuficiente para algún item';
  end if;

  -- Create human-friendly order_ref: CC-YYYYMMDD-<sequence>
  select 'CC-' || to_char(now(),'YYYYMMDD') || '-' || lpad(nextval('order_ref_seq')::text, 6, '0') into v_order_ref;

  -- Create paid order (pago confirmado directamente)
  insert into public.orders (total_amount, status, is_paid, payment_intent_id, order_ref)
  values (p_total_amount, 'paid', true, p_payment_intent_id, v_order_ref)
  returning id into v_order_id;

  -- Insert items
  insert into public.order_items (order_id, cocktail_id, size_id, quantity, unit_price, item_total)
  select
    v_order_id,
    it.cocktail_id,
    it.size_id,
    it.quantity,
    coalesce(it.unit_price, 0),
    coalesce(it.unit_price, 0) * it.quantity
  from jsonb_to_recordset(p_items)
    as it(cocktail_id uuid, size_id uuid, quantity int, unit_price numeric);

  -- Decrement stock
  update public.cocktail_sizes cs
     set stock_quantity = cs.stock_quantity - it.quantity
  from jsonb_to_recordset(p_items)
    as it(cocktail_id uuid, size_id uuid, quantity int)
  where cs.cocktail_id = it.cocktail_id
    and cs.sizes_id = it.size_id;

end;
$$;

-- Optional GRANTs depending on your RLS model (service role can always execute)
-- grant execute on function public.decrement_stock_and_create_order(text, numeric, jsonb) to authenticated;



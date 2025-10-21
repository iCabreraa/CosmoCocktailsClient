-- One-click verification after a payment
-- Replace :PI with a real payment_intent_id

with ord as (
  select id, total_amount, status, is_paid, payment_intent_id, order_date
  from public.orders
  where payment_intent_id = :PI
  order by order_date desc
  limit 1
), items as (
  select oi.* from public.order_items oi where oi.order_id = (select id from ord)
)
select 'order' as section, to_jsonb(o.*) as data from ord o
union all
select 'items' as section, to_jsonb(i.*) from items i
union all
select 'stock' as section, to_jsonb(cs.*)
from public.cocktail_sizes cs
join items i on i.cocktail_id = cs.cocktail_id and i.size_id = cs.sizes_id;




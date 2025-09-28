-- Políticas RLS simplificadas para Cosmococktails
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktail_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA TABLA USERS
-- Solo admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden crear usuarios
CREATE POLICY "Admins can create users" ON public.users
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden actualizar usuarios
CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- 3. POLÍTICAS PARA TABLA COCKTAILS
-- Todos pueden leer cócteles (público)
CREATE POLICY "Anyone can view cocktails" ON public.cocktails
  FOR SELECT USING (true);

-- Solo admins pueden crear cócteles
CREATE POLICY "Admins can create cocktails" ON public.cocktails
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden actualizar cócteles
CREATE POLICY "Admins can update cocktails" ON public.cocktails
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden eliminar cócteles
CREATE POLICY "Admins can delete cocktails" ON public.cocktails
  FOR DELETE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- 4. POLÍTICAS PARA TABLA COCKTAIL_SIZES
-- Todos pueden leer tamaños de cócteles
CREATE POLICY "Anyone can view cocktail sizes" ON public.cocktail_sizes
  FOR SELECT USING (true);

-- Solo admins pueden gestionar tamaños
CREATE POLICY "Admins can manage cocktail sizes" ON public.cocktail_sizes
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- 5. POLÍTICAS PARA TABLA SIZES
-- Todos pueden leer tamaños
CREATE POLICY "Anyone can view sizes" ON public.sizes
  FOR SELECT USING (true);

-- Solo admins pueden gestionar tamaños
CREATE POLICY "Admins can manage sizes" ON public.sizes
  FOR ALL USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- 6. POLÍTICAS PARA TABLA ORDERS
-- Usuarios autenticados pueden ver sus propios pedidos
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    (auth.jwt() ->> 'sub')::uuid = user_id
  );

-- Usuarios autenticados pueden crear pedidos
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'sub')::uuid = user_id
  );

-- Solo admins pueden actualizar pedidos
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Solo admins pueden eliminar pedidos
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Admins pueden ver todos los pedidos
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- 7. POLÍTICAS PARA TABLA ORDER_ITEMS
-- Usuarios autenticados pueden ver items de sus pedidos
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (auth.jwt() ->> 'sub')::uuid
    )
  );

-- Usuarios autenticados pueden crear items en sus pedidos
CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (auth.jwt() ->> 'sub')::uuid
    )
  );

-- Solo admins pueden actualizar/eliminar order items
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR UPDATE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );

-- Admins pueden ver todos los order items
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
  );


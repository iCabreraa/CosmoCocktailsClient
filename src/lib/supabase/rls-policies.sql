-- Políticas RLS para Cosmococktails
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktail_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;

-- 2. Función helper para obtener el rol del usuario
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::json ->> 'role',
    'client'
  )::TEXT;
$$;

-- 3. Función helper para verificar si es admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT auth.user_role() = 'admin';
$$;

-- 4. Función helper para obtener user_id del JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'sub')::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID
  );
$$;

-- 5. POLÍTICAS PARA TABLA USERS
-- Solo admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (auth.is_admin());

-- Solo admins pueden crear usuarios
CREATE POLICY "Admins can create users" ON public.users
  FOR INSERT WITH CHECK (auth.is_admin());

-- Solo admins pueden actualizar usuarios
CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (auth.is_admin());

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (auth.is_admin());

-- 6. POLÍTICAS PARA TABLA COCKTAILS
-- Todos pueden leer cócteles (público)
CREATE POLICY "Anyone can view cocktails" ON public.cocktails
  FOR SELECT USING (true);

-- Solo admins pueden crear cócteles
CREATE POLICY "Admins can create cocktails" ON public.cocktails
  FOR INSERT WITH CHECK (auth.is_admin());

-- Solo admins pueden actualizar cócteles
CREATE POLICY "Admins can update cocktails" ON public.cocktails
  FOR UPDATE USING (auth.is_admin());

-- Solo admins pueden eliminar cócteles
CREATE POLICY "Admins can delete cocktails" ON public.cocktails
  FOR DELETE USING (auth.is_admin());

-- 7. POLÍTICAS PARA TABLA COCKTAIL_SIZES
-- Todos pueden leer tamaños de cócteles
CREATE POLICY "Anyone can view cocktail sizes" ON public.cocktail_sizes
  FOR SELECT USING (true);

-- Solo admins pueden gestionar tamaños
CREATE POLICY "Admins can manage cocktail sizes" ON public.cocktail_sizes
  FOR ALL USING (auth.is_admin());

-- 8. POLÍTICAS PARA TABLA SIZES
-- Todos pueden leer tamaños
CREATE POLICY "Anyone can view sizes" ON public.sizes
  FOR SELECT USING (true);

-- Solo admins pueden gestionar tamaños
CREATE POLICY "Admins can manage sizes" ON public.sizes
  FOR ALL USING (auth.is_admin());

-- 9. POLÍTICAS PARA TABLA ORDERS
-- Usuarios autenticados pueden ver sus propios pedidos
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.user_id() = user_id);

-- Usuarios autenticados pueden crear pedidos
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.user_id() = user_id);

-- Solo admins pueden actualizar pedidos
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (auth.is_admin());

-- Solo admins pueden eliminar pedidos
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (auth.is_admin());

-- 10. POLÍTICAS PARA TABLA ORDER_ITEMS
-- Usuarios autenticados pueden ver items de sus pedidos
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.user_id()
    )
  );

-- Usuarios autenticados pueden crear items en sus pedidos
CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.user_id()
    )
  );

-- Solo admins pueden actualizar/eliminar order items
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE USING (auth.is_admin());

-- 11. POLÍTICA ESPECIAL: Admins pueden ver todos los pedidos
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (auth.is_admin());

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (auth.is_admin());

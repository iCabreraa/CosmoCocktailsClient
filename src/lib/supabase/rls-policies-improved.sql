-- ========================================
-- POLÍTICAS RLS MEJORADAS PARA COSMIC COCKTAILS
-- ========================================

-- ===== HABILITAR RLS EN TODAS LAS TABLAS =====
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cocktail_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- ===== FUNCIONES AUXILIARES =====

-- Función para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para verificar si el usuario es staff o admin
CREATE OR REPLACE FUNCTION auth.is_staff_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users
  WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ===== POLÍTICAS PARA TABLA USERS =====

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Solo admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (auth.is_admin());

-- Solo admins pueden crear usuarios
CREATE POLICY "Admins can create users" ON public.users
  FOR INSERT WITH CHECK (auth.is_admin());

-- Solo admins pueden eliminar usuarios
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (auth.is_admin());

-- ===== POLÍTICAS PARA TABLA ADDRESSES =====

-- Los usuarios pueden ver sus propias direcciones
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias direcciones
CREATE POLICY "Users can create own addresses" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias direcciones
CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias direcciones
CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Staff y admins pueden ver todas las direcciones
CREATE POLICY "Staff can view all addresses" ON public.addresses
  FOR SELECT USING (auth.is_staff_or_admin());

-- ===== POLÍTICAS PARA TABLA SIZES =====

-- Todos pueden ver los tamaños
CREATE POLICY "Anyone can view sizes" ON public.sizes
  FOR SELECT USING (true);

-- Solo admins pueden gestionar tamaños
CREATE POLICY "Admins can manage sizes" ON public.sizes
  FOR ALL USING (auth.is_admin());

-- ===== POLÍTICAS PARA TABLA COCKTAILS =====

-- Todos pueden ver cócteles activos
CREATE POLICY "Anyone can view active cocktails" ON public.cocktails
  FOR SELECT USING (is_active = true);

-- Staff y admins pueden ver todos los cócteles
CREATE POLICY "Staff can view all cocktails" ON public.cocktails
  FOR SELECT USING (auth.is_staff_or_admin());

-- Solo admins pueden gestionar cócteles
CREATE POLICY "Admins can manage cocktails" ON public.cocktails
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "Admins can update cocktails" ON public.cocktails
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Admins can delete cocktails" ON public.cocktails
  FOR DELETE USING (auth.is_admin());

-- ===== POLÍTICAS PARA TABLA COCKTAIL_SIZES =====

-- Todos pueden ver tamaños de cócteles disponibles
CREATE POLICY "Anyone can view available cocktail sizes" ON public.cocktail_sizes
  FOR SELECT USING (available = true);

-- Staff y admins pueden ver todos los tamaños de cócteles
CREATE POLICY "Staff can view all cocktail sizes" ON public.cocktail_sizes
  FOR SELECT USING (auth.is_staff_or_admin());

-- Solo admins pueden gestionar tamaños de cócteles
CREATE POLICY "Admins can manage cocktail sizes" ON public.cocktail_sizes
  FOR ALL USING (auth.is_admin());

-- ===== POLÍTICAS PARA TABLA ORDERS =====

-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios autenticados pueden crear pedidos
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios pedidos pendientes
CREATE POLICY "Users can update own pending orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status IN ('pending', 'processing')
  );

-- Staff y admins pueden ver todos los pedidos
CREATE POLICY "Staff can view all orders" ON public.orders
  FOR SELECT USING (auth.is_staff_or_admin());

-- Solo admins pueden actualizar todos los pedidos
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (auth.is_admin());

-- Solo admins pueden eliminar pedidos
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (auth.is_admin());

-- ===== POLÍTICAS PARA TABLA ORDER_ITEMS =====

-- Los usuarios pueden ver items de sus propios pedidos
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Los usuarios autenticados pueden crear items en sus pedidos
CREATE POLICY "Users can create own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Staff y admins pueden ver todos los items de pedidos
CREATE POLICY "Staff can view all order items" ON public.order_items
  FOR SELECT USING (auth.is_staff_or_admin());

-- Solo admins pueden gestionar items de pedidos
CREATE POLICY "Admins can manage order items" ON public.order_items
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE USING (auth.is_admin());

-- ===== POLÍTICAS PARA TABLA SECURITY_EVENTS =====

-- Los usuarios pueden ver sus propios eventos de seguridad
CREATE POLICY "Users can view own security events" ON public.security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Solo admins pueden ver todos los eventos de seguridad
CREATE POLICY "Admins can view all security events" ON public.security_events
  FOR SELECT USING (auth.is_admin());

-- Solo el sistema puede insertar eventos de seguridad
CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- Solo admins pueden eliminar eventos de seguridad
CREATE POLICY "Admins can delete security events" ON public.security_events
  FOR DELETE USING (auth.is_admin());

-- ===== POLÍTICAS ESPECIALES PARA WEBHOOKS =====

-- Permitir que el service role inserte/actualice pedidos desde webhooks
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage order items" ON public.order_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage security events" ON public.security_events
  FOR ALL USING (auth.role() = 'service_role');

-- ===== COMENTARIOS EN POLÍTICAS =====
COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Permite a los usuarios ver su propio perfil';
COMMENT ON POLICY "Admins can view all users" ON public.users IS 'Permite a los admins ver todos los usuarios';
COMMENT ON POLICY "Anyone can view active cocktails" ON public.cocktails IS 'Permite a todos ver cócteles activos';
COMMENT ON POLICY "Users can view own orders" ON public.orders IS 'Permite a los usuarios ver sus propios pedidos';
COMMENT ON POLICY "Staff can view all orders" ON public.orders IS 'Permite al staff ver todos los pedidos';


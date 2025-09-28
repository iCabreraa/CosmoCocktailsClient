-- ========================================
-- ESQUEMA MEJORADO PARA COSMIC COCKTAILS
-- ========================================

-- ===== EXTENSIÓN PARA UUIDs =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== TABLA DE USUARIOS (EXTENSIÓN DE AUTH.USERS) =====
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'staff', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE DIRECCIONES =====
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('billing', 'shipping')),
  full_name TEXT NOT NULL,
  company TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE TAMAÑOS =====
CREATE TABLE IF NOT EXISTS public.sizes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  volume_ml INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE CÓCTELES =====
CREATE TABLE IF NOT EXISTS public.cocktails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  alcohol_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  has_non_alcoholic_version BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE TAMAÑOS DE CÓCTELES =====
CREATE TABLE IF NOT EXISTS public.cocktail_sizes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cocktail_id UUID REFERENCES public.cocktails(id) ON DELETE CASCADE NOT NULL,
  size_id UUID REFERENCES public.sizes(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cocktail_id, size_id)
);

-- ===== TABLA DE PEDIDOS =====
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  order_ref TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'cash', 'bank_transfer')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_intent_id TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_date TIMESTAMP WITH TIME ZONE,
  delivery_address_id UUID REFERENCES public.addresses(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE ITEMS DE PEDIDO =====
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  cocktail_id UUID REFERENCES public.cocktails(id) ON DELETE CASCADE NOT NULL,
  size_id UUID REFERENCES public.sizes(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  item_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TABLA DE EVENTOS DE SEGURIDAD =====
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'permission_denied', 'suspicious_activity')),
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ÍNDICES PARA OPTIMIZACIÓN =====

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Índices para direcciones
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON public.addresses(type);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default);

-- Índices para cócteles
CREATE INDEX IF NOT EXISTS idx_cocktails_name ON public.cocktails(name);
CREATE INDEX IF NOT EXISTS idx_cocktails_is_active ON public.cocktails(is_active);
CREATE INDEX IF NOT EXISTS idx_cocktails_alcohol_percentage ON public.cocktails(alcohol_percentage);
CREATE INDEX IF NOT EXISTS idx_cocktails_tags ON public.cocktails USING GIN(tags);

-- Índices para tamaños de cócteles
CREATE INDEX IF NOT EXISTS idx_cocktail_sizes_cocktail_id ON public.cocktail_sizes(cocktail_id);
CREATE INDEX IF NOT EXISTS idx_cocktail_sizes_size_id ON public.cocktail_sizes(size_id);
CREATE INDEX IF NOT EXISTS idx_cocktail_sizes_available ON public.cocktail_sizes(available);
CREATE INDEX IF NOT EXISTS idx_cocktail_sizes_price ON public.cocktail_sizes(price);

-- Índices para pedidos
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON public.orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent_id ON public.orders(payment_intent_id);

-- Índices para items de pedido
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_cocktail_id ON public.order_items(cocktail_id);
CREATE INDEX IF NOT EXISTS idx_order_items_size_id ON public.order_items(size_id);

-- Índices para eventos de seguridad
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON public.security_events(ip_address);

-- ===== FUNCIONES DE ACTUALIZACIÓN AUTOMÁTICA =====

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sizes_updated_at BEFORE UPDATE ON public.sizes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cocktails_updated_at BEFORE UPDATE ON public.cocktails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cocktail_sizes_updated_at BEFORE UPDATE ON public.cocktail_sizes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== FUNCIÓN PARA GENERAR REFERENCIA DE PEDIDO =====
CREATE OR REPLACE FUNCTION generate_order_ref()
RETURNS TEXT AS $$
DECLARE
  new_ref TEXT;
  counter INTEGER;
BEGIN
  -- Obtener el siguiente número de secuencia
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_ref FROM 'ORD(\d+)') AS INTEGER)), 0) + 1
  INTO counter
  FROM public.orders
  WHERE order_ref ~ '^ORD\d+$';
  
  -- Generar referencia con formato ORD000001
  new_ref := 'ORD' || LPAD(counter::TEXT, 6, '0');
  
  RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- ===== FUNCIÓN PARA CALCULAR TOTALES DE PEDIDO =====
CREATE OR REPLACE FUNCTION calculate_order_totals(order_id UUID)
RETURNS TABLE(
  subtotal DECIMAL(10,2),
  vat_amount DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  total_amount DECIMAL(10,2)
) AS $$
DECLARE
  vat_rate DECIMAL(5,4) := 0.21; -- 21% IVA
  base_shipping DECIMAL(10,2) := 4.99; -- Costo base de envío
  calculated_subtotal DECIMAL(10,2);
  calculated_vat DECIMAL(10,2);
  calculated_shipping DECIMAL(10,2);
  calculated_total DECIMAL(10,2);
BEGIN
  -- Calcular subtotal
  SELECT COALESCE(SUM(item_total), 0)
  INTO calculated_subtotal
  FROM public.order_items
  WHERE order_id = calculate_order_totals.order_id;
  
  -- Calcular IVA
  calculated_vat := calculated_subtotal * vat_rate;
  
  -- Calcular envío (gratis si el pedido es mayor a 50€)
  calculated_shipping := CASE 
    WHEN calculated_subtotal >= 50 THEN 0
    ELSE base_shipping
  END;
  
  -- Calcular total
  calculated_total := calculated_subtotal + calculated_vat + calculated_shipping;
  
  RETURN QUERY SELECT calculated_subtotal, calculated_vat, calculated_shipping, calculated_total;
END;
$$ LANGUAGE plpgsql;

-- ===== FUNCIÓN PARA VALIDAR INVENTARIO =====
CREATE OR REPLACE FUNCTION validate_inventory(
  p_cocktail_id UUID,
  p_size_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  is_available BOOLEAN;
  current_stock INTEGER;
BEGIN
  -- Verificar si el cóctel y tamaño están disponibles
  SELECT available
  INTO is_available
  FROM public.cocktail_sizes
  WHERE cocktail_id = p_cocktail_id AND size_id = p_size_id;
  
  -- Si no está disponible, retornar false
  IF NOT is_available THEN
    RETURN FALSE;
  END IF;
  
  -- Aquí podrías agregar lógica de stock si implementas inventario
  -- Por ahora, asumimos que si está disponible, hay stock suficiente
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ===== COMENTARIOS EN TABLAS =====
COMMENT ON TABLE public.users IS 'Información extendida de usuarios autenticados';
COMMENT ON TABLE public.addresses IS 'Direcciones de facturación y entrega de usuarios';
COMMENT ON TABLE public.sizes IS 'Tamaños disponibles para cócteles';
COMMENT ON TABLE public.cocktails IS 'Catálogo de cócteles disponibles';
COMMENT ON TABLE public.cocktail_sizes IS 'Precios y disponibilidad por tamaño de cóctel';
COMMENT ON TABLE public.orders IS 'Pedidos realizados por usuarios';
COMMENT ON TABLE public.order_items IS 'Items individuales dentro de cada pedido';
COMMENT ON TABLE public.security_events IS 'Registro de eventos de seguridad y auditoría';


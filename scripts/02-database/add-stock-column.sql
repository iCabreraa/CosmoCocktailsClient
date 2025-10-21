-- Script para añadir columna de stock a la tabla cocktail_sizes
-- Ejecutar en Supabase SQL Editor

-- Añadir columna stock_quantity a cocktail_sizes
ALTER TABLE public.cocktail_sizes 
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Añadir comentario a la columna
COMMENT ON COLUMN public.cocktail_sizes.stock_quantity IS 'Cantidad de stock disponible para este cóctel en este tamaño';

-- Actualizar la columna available basada en stock_quantity
UPDATE public.cocktail_sizes 
SET available = (stock_quantity > 0)
WHERE stock_quantity IS NOT NULL;

-- Crear índice para mejorar rendimiento de consultas de stock
CREATE INDEX IF NOT EXISTS idx_cocktail_sizes_stock 
ON public.cocktail_sizes(stock_quantity) 
WHERE stock_quantity IS NOT NULL;

-- Verificar que la columna se añadió correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'cocktail_sizes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

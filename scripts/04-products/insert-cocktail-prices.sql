-- Script para insertar precios de cócteles por tamaño
-- Ejecutar en Supabase SQL Editor

-- Primero, verificar que tenemos los cócteles
SELECT id, name FROM cocktails;

-- Insertar tamaños si no existen
INSERT INTO sizes (id, name, volume_ml) VALUES
('size-200ml', '200ml', 200),
('size-20ml', '20ml', 20)
ON CONFLICT (id) DO NOTHING;

-- Insertar precios para cada cóctel
-- Sex on the Beach
INSERT INTO cocktail_sizes (cocktail_id, sizes_id, price, available) VALUES
('1', 'size-200ml', 7.00, true),
('1', 'size-20ml', 5.00, true)
ON CONFLICT (cocktail_id, sizes_id) DO UPDATE SET
  price = EXCLUDED.price,
  available = EXCLUDED.available;

-- Pornstar Martini
INSERT INTO cocktail_sizes (cocktail_id, sizes_id, price, available) VALUES
('2', 'size-200ml', 7.00, true),
('2', 'size-20ml', 5.00, true)
ON CONFLICT (cocktail_id, sizes_id) DO UPDATE SET
  price = EXCLUDED.price,
  available = EXCLUDED.available;

-- Piña Colada
INSERT INTO cocktail_sizes (cocktail_id, sizes_id, price, available) VALUES
('3', 'size-200ml', 7.00, true),
('3', 'size-20ml', 5.00, true)
ON CONFLICT (cocktail_id, sizes_id) DO UPDATE SET
  price = EXCLUDED.price,
  available = EXCLUDED.available;

-- Gin and Tonic
INSERT INTO cocktail_sizes (cocktail_id, sizes_id, price, available) VALUES
('4', 'size-200ml', 7.00, true),
('4', 'size-20ml', 5.00, true)
ON CONFLICT (cocktail_id, sizes_id) DO UPDATE SET
  price = EXCLUDED.price,
  available = EXCLUDED.available;

-- Verificar que se insertaron correctamente
SELECT 
  c.name as cocktail_name,
  s.name as size_name,
  s.volume_ml,
  cs.price,
  cs.available
FROM cocktail_sizes cs
JOIN cocktails c ON cs.cocktail_id = c.id
JOIN sizes s ON cs.sizes_id = s.id
ORDER BY c.name, s.volume_ml;


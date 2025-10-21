-- Ejecutar este SQL directamente en Supabase SQL Editor
-- Deshabilitar RLS temporalmente para insertar datos

-- Insertar precios para cada cóctel
INSERT INTO cocktail_sizes (cocktail_id, sizes_id, price, available) VALUES
-- Sex on the Beach
('fbf19a0d-fa0c-4bda-9843-13b29e5a3cb3', '3654949e-b29b-4a94-8556-f7f99658fd6f', 7.00, true),
('fbf19a0d-fa0c-4bda-9843-13b29e5a3cb3', 'b49fdc54-4404-435e-b5a4-574cc71b6bbd', 5.00, true),

-- Pornstar Martini
('75688201-f6a4-4506-b436-b18eb3baef5a', '3654949e-b29b-4a94-8556-f7f99658fd6f', 7.00, true),
('75688201-f6a4-4506-b436-b18eb3baef5a', 'b49fdc54-4404-435e-b5a4-574cc71b6bbd', 5.00, true),

-- Piña Colada
('91bb0ad5-5950-4c0a-9c84-b8c6d9c751aa', '3654949e-b29b-4a94-8556-f7f99658fd6f', 7.00, true),
('91bb0ad5-5950-4c0a-9c84-b8c6d9c751aa', 'b49fdc54-4404-435e-b5a4-574cc71b6bbd', 5.00, true),

-- Gin and Tonic
('64a20369-b2c1-4a95-ab40-922f05e36f4d', '3654949e-b29b-4a94-8556-f7f99658fd6f', 7.00, true),
('64a20369-b2c1-4a95-ab40-922f05e36f4d', 'b49fdc54-4404-435e-b5a4-574cc71b6bbd', 5.00, true),

-- Margarita
('fda62796-0c1a-4a46-8518-72ee364fc6e7', '3654949e-b29b-4a94-8556-f7f99658fd6f', 7.00, true),
('fda62796-0c1a-4a46-8518-72ee364fc6e7', 'b49fdc54-4404-435e-b5a4-574cc71b6bbd', 5.00, true),

-- Paloma
('246c2c92-d777-4e93-8dea-4a3851de96cb', '3654949e-b29b-4a94-8556-f7f99658fd6f', 7.00, true),
('246c2c92-d777-4e93-8dea-4a3851de96cb', 'b49fdc54-4404-435e-b5a4-574cc71b6bbd', 5.00, true)

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


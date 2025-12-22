-- Limpiar politicas permisivas en orders
-- Ejecutar en Supabase SQL Editor

-- Estas politicas permiten acceso total a cualquier usuario autenticado.
-- Deben eliminarse para respetar el user_id.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for users authenticated" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for users authenticated" ON public.orders;

-- Opcional: eliminar duplicados legacy en user_favorites (mantener las politicas \"Users can ...\")
DROP POLICY IF EXISTS "user_favorites_select_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_modify_own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_favorites_delete_own" ON public.user_favorites;

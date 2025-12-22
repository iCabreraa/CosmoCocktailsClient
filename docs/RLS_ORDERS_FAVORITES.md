# RLS para orders y user_favorites

Este documento valida que las politicas RLS existen y bloquean el acceso a datos de otros usuarios.

## Referencias en el repo
- `src/lib/supabase/rls-policies.sql` (orders y funciones helper)
- `scripts/03-users/create-user-favorites-final.sql` (user_favorites)
- `scripts/08-testing/check-orders-favorites-rls.sql` (verificacion)

## Pasos de verificacion
1) Abrir Supabase SQL Editor y ejecutar:
   - `scripts/08-testing/check-orders-favorites-rls.sql`
2) Confirmar resultados esperados:
   - `orders` y `user_favorites` tienen `rls_enabled = true`
   - Existen politicas para:
     - orders: ver/insertar propio usuario, admin update/delete
     - user_favorites: ver/insertar/eliminar propio usuario

## Hallazgos y correccion
Si aparecen politicas como:
- `Enable read access for authenticated users`
- `Enable insert for authenticated users`
- `Enable update for users authenticated`
- `Enable delete for users authenticated`

Significa que cualquier usuario autenticado puede leer o modificar pedidos de otros usuarios.
Para corregirlo, ejecutar:
- `scripts/08-testing/fix-orders-rls.sql`

## Nota sobre auth.uid() vs auth.user_id()
- En `rls-policies.sql` existe un helper `auth.user_id()` que lee el `sub` del JWT.
- `auth.user_id()` es equivalente a `auth.uid()` para este uso.
- Las politicas de orders usan `auth.user_id()` y las de favorites usan `auth.uid()`.

## Si falta alguna politica
1) Ejecutar:
   - `src/lib/supabase/rls-policies.sql` (orders)
   - `scripts/03-users/create-user-favorites-final.sql` (user_favorites)
2) Volver a ejecutar la verificacion.

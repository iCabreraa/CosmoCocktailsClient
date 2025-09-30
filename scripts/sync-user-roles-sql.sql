-- Script SQL para sincronizar roles de usuarios entre public.users y auth.users.user_metadata
-- Ejecutar en Supabase SQL Editor

-- 1. Crear función para actualizar user_metadata con el rol
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Iterar sobre todos los usuarios en public.users
    FOR user_record IN 
        SELECT id, email, role 
        FROM public.users 
        WHERE role IS NOT NULL
    LOOP
        -- Actualizar user_metadata en auth.users
        UPDATE auth.users 
        SET 
            raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
                                 jsonb_build_object('role', user_record.role),
            updated_at = NOW()
        WHERE id = user_record.id;
        
        RAISE NOTICE 'Usuario sincronizado: % -> rol: %', user_record.email, user_record.role;
    END LOOP;
    
    RAISE NOTICE 'Sincronización completada';
END;
$$;

-- 2. Ejecutar la función
SELECT sync_user_roles();

-- 3. Verificar resultados
SELECT 
    u.email,
    u.role as public_role,
    au.raw_user_meta_data->>'role' as auth_role
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.role IS NOT NULL;

-- 4. Limpiar función temporal
DROP FUNCTION IF EXISTS sync_user_roles();

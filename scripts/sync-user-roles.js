// Script para sincronizar roles de usuarios entre public.users y auth.users.user_metadata
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitas esta clave

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUserRoles() {
  console.log('🔄 Iniciando sincronización de roles de usuarios...');

  try {
    // 1. Obtener todos los usuarios de public.users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role');

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError);
      return;
    }

    console.log(`📊 Encontrados ${users?.length || 0} usuarios para sincronizar`);

    if (!users || users.length === 0) {
      console.log('✅ No hay usuarios para sincronizar');
      return;
    }

    // 2. Para cada usuario, actualizar su user_metadata en auth.users
    for (const user of users) {
      try {
        console.log(`🔄 Sincronizando usuario: ${user.email} (rol: ${user.role})`);

        // Actualizar user_metadata en auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              role: user.role,
              email: user.email,
            }
          }
        );

        if (authError) {
          console.error(`❌ Error actualizando ${user.email}:`, authError);
          continue;
        }

        console.log(`✅ Usuario sincronizado: ${user.email} -> rol: ${user.role}`);
      } catch (error) {
        console.error(`❌ Error procesando usuario ${user.email}:`, error);
      }
    }

    console.log('🎉 Sincronización completada');
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  syncUserRoles();
}

export { syncUserRoles };

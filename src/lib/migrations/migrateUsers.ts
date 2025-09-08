// Script para migrar usuarios existentes a Supabase Auth
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function migrateUsersToSupabaseAuth() {
  const supabase = createClient();
  
  console.log("🔄 Iniciando migración de usuarios a Supabase Auth...");
  
  try {
    // 1. Obtener usuarios existentes de la tabla users
    const { data: existingUsers, error: fetchError } = await supabase
      .from("users")
      .select("*");
    
    if (fetchError) {
      console.error("❌ Error obteniendo usuarios existentes:", fetchError);
      return;
    }
    
    console.log(`📊 Encontrados ${existingUsers?.length || 0} usuarios para migrar`);
    
    if (!existingUsers || existingUsers.length === 0) {
      console.log("✅ No hay usuarios para migrar");
      return;
    }
    
    // 2. Crear usuarios en Supabase Auth
    for (const user of existingUsers) {
      try {
        // Crear usuario en Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: "temp_password_123", // Usuario deberá cambiar contraseña
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            phone: user.phone,
            role: user.role || "client",
            avatar_url: user.avatar_url,
          },
        });
        
        if (authError) {
          console.error(`❌ Error creando usuario ${user.email}:`, authError);
          continue;
        }
        
        console.log(`✅ Usuario migrado: ${user.email} (ID: ${authUser.user?.id})`);
        
        // 3. Actualizar referencias en tablas relacionadas
        if (authUser.user?.id) {
          // Actualizar pedidos del usuario
          await supabase
            .from("orders")
            .update({ user_id: authUser.user.id })
            .eq("user_id", user.id);
          
          // Actualizar otros datos relacionados si existen
          // (añadir más tablas según sea necesario)
        }
        
      } catch (error) {
        console.error(`❌ Error procesando usuario ${user.email}:`, error);
      }
    }
    
    console.log("🎉 Migración completada");
    
  } catch (error) {
    console.error("❌ Error en migración:", error);
  }
}

// Función para crear usuario admin por defecto
export async function createDefaultAdmin() {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "admin@cosmococktails.com",
      password: "admin123456",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin Cosmococktails",
        phone: "+31 654321987",
        role: "admin",
        avatar_url: "https://i.pravatar.cc/300?img=15",
      },
    });
    
    if (error) {
      console.error("❌ Error creando admin:", error);
    } else {
      console.log("✅ Admin creado:", data.user?.email);
    }
  } catch (error) {
    console.error("❌ Error creando admin:", error);
  }
}

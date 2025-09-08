// Script de configuración inicial para Supabase Auth
import { createClient } from "@/lib/supabase/server";

export async function setupInitialAuth() {
  const supabase = createClient();

  console.log("🔧 Configurando autenticación inicial...");

  try {
    // 1. Verificar si ya existe un admin
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers();
    const adminExists = users.some(
      user => user.user_metadata?.role === "admin"
    );

    if (adminExists) {
      console.log("✅ Admin ya existe");
      return;
    }

    // 2. Crear admin por defecto
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
      return;
    }

    console.log("✅ Admin creado:", data.user?.email);

    // 3. Crear usuario de prueba
    const { data: testUser, error: testError } =
      await supabase.auth.admin.createUser({
        email: "test@cosmococktails.com",
        password: "test123456",
        email_confirm: true,
        user_metadata: {
          full_name: "Usuario de Prueba",
          phone: "+31 612345678",
          role: "client",
          avatar_url: "https://i.pravatar.cc/300?img=1",
        },
      });

    if (testError) {
      console.error("❌ Error creando usuario de prueba:", testError);
    } else {
      console.log("✅ Usuario de prueba creado:", testUser.user?.email);
    }

    console.log("🎉 Configuración inicial completada");
    console.log("📧 Admin: admin@cosmococktails.com / admin123456");
    console.log("📧 Cliente: test@cosmococktails.com / test123456");
  } catch (error) {
    console.error("❌ Error en configuración:", error);
  }
}

// Función para verificar el estado de RLS
export async function checkRLSStatus() {
  const supabase = createClient();

  try {
    // Verificar si RLS está habilitado en las tablas principales
    const tables = ["users", "cocktails", "orders", "order_items"];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        console.log(`❌ Tabla ${table}: RLS puede estar deshabilitado`);
      } else {
        console.log(`✅ Tabla ${table}: Accesible`);
      }
    }
  } catch (error) {
    console.error("❌ Error verificando RLS:", error);
  }
}

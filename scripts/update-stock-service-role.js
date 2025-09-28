const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwenR5emhvc3FibXpwdGF6bG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODgzNzAzMiwiZXhwIjoyMDU0NDEzMDMyfQ.bszS6IcAEMEccKBH8r9ZX-WisTtJoQKnh2Zw_e7tWoY"
);

async function updateStockWithServiceRole() {
  try {
    console.log("🚀 Actualizando stock con service role key...");

    // 1. Obtener todos los cocktail_sizes
    console.log("📋 Obteniendo productos existentes...");
    const { data: cocktailSizes, error: fetchError } = await supabase.from(
      "cocktail_sizes"
    ).select(`
        cocktail_id,
        sizes_id,
        price,
        available,
        stock_quantity,
        cocktails!inner(name),
        sizes!inner(name, volume_ml)
      `);

    if (fetchError) {
      console.error("❌ Error obteniendo productos:", fetchError);
      return;
    }

    console.log(`📦 Encontrados ${cocktailSizes.length} productos`);

    // 2. Actualizar stock para TODOS los productos
    const updates = [];

    for (const item of cocktailSizes) {
      // Stock inicial basado en el tamaño
      const initialStock = item.sizes.volume_ml === 200 ? 50 : 100; // 200ml: 50 unidades, 20ml: 100 unidades

      updates.push({
        cocktail_id: item.cocktail_id,
        sizes_id: item.sizes_id,
        stock_quantity: initialStock,
        available: true,
      });

      console.log(
        `  📦 ${item.cocktails.name} - ${item.sizes.name}: ${initialStock} unidades`
      );
    }

    // 3. Actualizar stock en la base de datos usando service role
    console.log(`💰 Actualizando stock para ${updates.length} productos...`);

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("cocktail_sizes")
        .update({
          stock_quantity: update.stock_quantity,
          available: update.available,
        })
        .eq("cocktail_id", update.cocktail_id)
        .eq("sizes_id", update.sizes_id);

      if (updateError) {
        console.error(
          `❌ Error actualizando ${update.cocktail_id}-${update.sizes_id}:`,
          updateError
        );
      } else {
        console.log(
          `✅ Stock actualizado: ${update.cocktail_id}-${update.sizes_id}`
        );
      }
    }

    // 4. Verificar resultado final
    console.log("\n🔍 Verificando resultado final...");
    const { data: finalCheck, error: checkError } = await supabase
      .from("cocktail_sizes")
      .select(
        `
        cocktail_id,
        sizes_id,
        price,
        available,
        stock_quantity,
        cocktails!inner(name),
        sizes!inner(name, volume_ml)
      `
      )
      .order("cocktails(name)")
      .order("sizes(volume_ml)");

    if (checkError) {
      console.error("❌ Error verificando resultado:", checkError);
      return;
    }

    console.log("\n📊 Resultado final:");
    finalCheck.forEach(item => {
      const status = item.available ? "✅" : "❌";
      console.log(
        `  ${status} ${item.cocktails.name} - ${item.sizes.name}: ${item.stock_quantity} unidades`
      );
    });

    console.log("🎉 ¡Actualización de stock completada exitosamente!");
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

updateStockWithServiceRole();

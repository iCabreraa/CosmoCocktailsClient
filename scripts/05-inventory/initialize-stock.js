const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de entorno de Supabase no encontradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeStock() {
  try {
    console.log("🚀 Inicializando stock de productos...");

    // 1. Obtener todos los cocktail_sizes existentes
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

    // 2. Inicializar stock para productos sin stock
    const updates = [];

    for (const item of cocktailSizes) {
      if (item.stock_quantity === null || item.stock_quantity === undefined) {
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
    }

    if (updates.length === 0) {
      console.log("✅ Todos los productos ya tienen stock configurado");
      return;
    }

    // 3. Actualizar stock en la base de datos
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
    console.log("🔍 Verificando resultado final...");
    const { data: finalCheck, error: checkError } = await supabase
      .from("cocktail_sizes")
      .select(
        `
        cocktail_id,
        sizes_id,
        stock_quantity,
        available,
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

    console.log("📊 Resultado final:");
    finalCheck.forEach(item => {
      const status = item.available ? "✅" : "❌";
      console.log(
        `  ${status} ${item.cocktails.name} - ${item.sizes.name}: ${item.stock_quantity} unidades`
      );
    });

    console.log("🎉 ¡Inicialización de stock completada exitosamente!");
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

initializeStock();

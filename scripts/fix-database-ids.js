const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabaseIds() {
  console.log("🔧 CORRIGIENDO IDs DE LA BASE DE DATOS");
  console.log("=".repeat(50));

  try {
    // 1. Verificar datos actuales
    console.log("\n1. VERIFICANDO DATOS ACTUALES...");
    const { data: cocktailSizes, error: fetchError } = await supabase
      .from("cocktail_sizes")
      .select(
        `
        cocktail_id,
        sizes_id,
        price,
        stock_quantity,
        available,
        cocktails!inner(id, name),
        sizes!inner(id, name, volume_ml)
      `
      )
      .limit(10);

    if (fetchError) {
      console.error("❌ Error obteniendo datos:", fetchError);
      return;
    }

    console.log("✅ Datos encontrados:", cocktailSizes.length);
    cocktailSizes.forEach((item, index) => {
      console.log(
        `  ${index + 1}. ${item.cocktails.name} - ${item.sizes.name} (${item.sizes.volume_ml}ml)`
      );
      console.log(`     Cocktail ID: ${item.cocktail_id}`);
      console.log(`     Size ID: ${item.sizes_id}`);
      console.log(`     Price: €${item.price}`);
      console.log(`     Stock: ${item.stock_quantity}`);
      console.log("     ---");
    });

    // 2. Verificar si hay IDs inválidos
    console.log("\n2. VERIFICANDO IDs INVÁLIDOS...");
    const invalidIds = cocktailSizes.filter(item => {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return (
        !uuidRegex.test(item.cocktail_id) || !uuidRegex.test(item.sizes_id)
      );
    });

    if (invalidIds.length > 0) {
      console.log(`❌ Encontrados ${invalidIds.length} IDs inválidos:`);
      invalidIds.forEach(item => {
        console.log(
          `  - ${item.cocktails.name}: cocktail_id=${item.cocktail_id}, sizes_id=${item.sizes_id}`
        );
      });
    } else {
      console.log("✅ Todos los IDs son válidos");
    }

    // 3. Verificar duplicados
    console.log("\n3. VERIFICANDO DUPLICADOS...");
    const combinations = new Map();
    cocktailSizes.forEach(item => {
      const key = `${item.cocktails.name}-${item.sizes.name}`;
      if (combinations.has(key)) {
        console.log(`❌ Duplicado encontrado: ${key}`);
        console.log(`   Original: ${JSON.stringify(combinations.get(key))}`);
        console.log(`   Duplicado: ${JSON.stringify(item)}`);
      } else {
        combinations.set(key, item);
      }
    });

    if (combinations.size === cocktailSizes.length) {
      console.log("✅ No hay duplicados");
    }

    console.log("\n✅ Análisis completado");
  } catch (error) {
    console.error("❌ Error en el análisis:", error);
  }
}

fixDatabaseIds().catch(console.error);

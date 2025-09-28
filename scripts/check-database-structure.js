const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabaseStructure() {
  try {
    console.log("🔍 Verificando estructura de la base de datos...\n");

    // 1. Verificar tabla cocktail_sizes directamente
    console.log("📋 Verificando tabla cocktail_sizes...");
    const { data: cocktailSizes, error: dataError } = await supabase
      .from("cocktail_sizes")
      .select("*")
      .limit(1);

    if (dataError) {
      console.error("❌ Error obteniendo datos:", dataError);
      return;
    }

    // 2. Verificar si existe stock_quantity
    if (cocktailSizes && cocktailSizes.length > 0) {
      const hasStockColumn = "stock_quantity" in cocktailSizes[0];
      if (hasStockColumn) {
        console.log("✅ Columna stock_quantity encontrada!");
      } else {
        console.log(
          "❌ Columna stock_quantity NO encontrada. Necesitas ejecutar el script SQL."
        );
        return;
      }
    } else {
      console.log("❌ No se encontraron datos en cocktail_sizes");
      return;
    }

    // 3. Verificar datos existentes
    console.log("\n📊 Verificando datos existentes...");
    const { data: allCocktailSizes, error: allDataError } = await supabase
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
      .limit(5);

    if (allDataError) {
      console.error("❌ Error obteniendo datos:", allDataError);
      return;
    }

    console.log(
      `✅ Encontrados ${allCocktailSizes.length} registros de prueba:`
    );
    allCocktailSizes.forEach(item => {
      console.log(
        `  - ${item.cocktails.name} (${item.sizes.name}): €${item.price} - Stock: ${item.stock_quantity ?? "NULL"}`
      );
    });

    // 4. Verificar total de registros
    const { count, error: countError } = await supabase
      .from("cocktail_sizes")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error contando registros:", countError);
    } else {
      console.log(`\n📈 Total de registros en cocktail_sizes: ${count}`);
    }

    console.log("\n🎉 Verificación completada exitosamente!");
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

checkDatabaseStructure();

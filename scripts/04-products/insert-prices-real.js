const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de entorno de Supabase no encontradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertCocktailPrices() {
  try {
    console.log("🚀 Iniciando inserción de precios...");

    // IDs reales de la base de datos
    const sizeIds = {
      "20ml": "b49fdc54-4404-435e-b5a4-574cc71b6bbd", // Shot (20ml)
      "200ml": "3654949e-b29b-4a94-8556-f7f99658fd6f", // Small Bottle (200ml)
    };

    const cocktailIds = [
      "fbf19a0d-fa0c-4bda-9843-13b29e5a3cb3", // Sex on the Beach
      "75688201-f6a4-4506-b436-b18eb3baef5a", // Pornstar Martini
      "91bb0ad5-5950-4c0a-9c84-b8c6d9c751aa", // Piña Colada
      "64a20369-b2c1-4a95-ab40-922f05e36f4d", // Gin and Tonic
      "fda62796-0c1a-4a46-8518-72ee364fc6e7", // Margarita
      "246c2c92-d777-4e93-8dea-4a3851de96cb", // Paloma
    ];

    // Insertar precios para cada cóctel
    console.log("💰 Insertando precios...");
    const prices = [];

    for (const cocktailId of cocktailIds) {
      prices.push(
        {
          cocktail_id: cocktailId,
          sizes_id: sizeIds["200ml"],
          price: 7.0,
          available: true,
        },
        {
          cocktail_id: cocktailId,
          sizes_id: sizeIds["20ml"],
          price: 5.0,
          available: true,
        }
      );
    }

    const { error: pricesError } = await supabase
      .from("cocktail_sizes")
      .upsert(prices);

    if (pricesError) {
      console.error("❌ Error insertando precios:", pricesError);
      return;
    }

    console.log("✅ Precios insertados correctamente");

    // Verificar inserción
    console.log("🔍 Verificando inserción...");
    const { data: verification, error: verifyError } = await supabase
      .from("cocktail_sizes")
      .select(
        `
        cocktail_id,
        sizes_id,
        price,
        available,
        cocktails!inner(name),
        sizes!inner(name, volume_ml)
      `
      )
      .order("cocktail_id")
      .order("volume_ml");

    if (verifyError) {
      console.error("❌ Error verificando:", verifyError);
      return;
    }

    console.log("📊 Resultado final:");
    verification.forEach(item => {
      console.log(
        `  ${item.cocktails.name} - ${item.sizes.name} (${item.sizes.volume_ml}ml): €${item.price}`
      );
    });

    console.log("🎉 ¡Inserción completada exitosamente!");
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

insertCocktailPrices();


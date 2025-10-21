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

    // 1. Insertar tamaños
    console.log("📏 Insertando tamaños...");
    const { error: sizesError } = await supabase.from("sizes").upsert([
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "200ml",
        volume_ml: 200,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "20ml",
        volume_ml: 20,
      },
    ]);

    if (sizesError) {
      console.error("❌ Error insertando tamaños:", sizesError);
      return;
    }
    console.log("✅ Tamaños insertados correctamente");

    // 2. Obtener cócteles existentes
    console.log("🍹 Obteniendo cócteles...");
    const { data: cocktails, error: cocktailsError } = await supabase
      .from("cocktails")
      .select("id, name");

    if (cocktailsError) {
      console.error("❌ Error obteniendo cócteles:", cocktailsError);
      return;
    }

    console.log(
      `📋 Encontrados ${cocktails.length} cócteles:`,
      cocktails.map(c => c.name)
    );

    // 3. Insertar precios para cada cóctel
    console.log("💰 Insertando precios...");
    const prices = [];

    for (const cocktail of cocktails) {
      prices.push(
        {
          cocktail_id: cocktail.id,
          sizes_id: "550e8400-e29b-41d4-a716-446655440001",
          price: 7.0,
          available: true,
        },
        {
          cocktail_id: cocktail.id,
          sizes_id: "550e8400-e29b-41d4-a716-446655440002",
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

    // 4. Verificar inserción
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

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de entorno de Supabase no encontradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCocktails() {
  try {
    console.log("🍹 Verificando cócteles existentes...");

    const { data: cocktails, error } = await supabase
      .from("cocktails")
      .select("id, name, description");

    if (error) {
      console.error("❌ Error:", error);
      return;
    }

    console.log(`📋 Encontrados ${cocktails.length} cócteles:`);
    cocktails.forEach(cocktail => {
      console.log(`  - ${cocktail.id}: ${cocktail.name}`);
    });

    console.log("\n🔍 Verificando tamaños existentes...");
    const { data: sizes, error: sizesError } = await supabase
      .from("sizes")
      .select("id, name, volume_ml");

    if (sizesError) {
      console.error("❌ Error con tamaños:", sizesError);
    } else {
      console.log(`📏 Encontrados ${sizes.length} tamaños:`);
      sizes.forEach(size => {
        console.log(`  - ${size.id}: ${size.name} (${size.volume_ml}ml)`);
      });
    }

    console.log("\n💰 Verificando precios existentes...");
    const { data: prices, error: pricesError } = await supabase.from(
      "cocktail_sizes"
    ).select(`
        cocktail_id,
        sizes_id,
        price,
        available,
        cocktails!inner(name),
        sizes!inner(name, volume_ml)
      `);

    if (pricesError) {
      console.error("❌ Error con precios:", pricesError);
    } else {
      console.log(`💵 Encontrados ${prices.length} precios:`);
      prices.forEach(price => {
        console.log(
          `  - ${price.cocktails.name}: ${price.sizes.name} - €${price.price}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

checkCocktails();


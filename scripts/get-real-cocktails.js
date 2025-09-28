require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getRealCocktails() {
  console.log("🔍 Getting real cocktails from database...");

  try {
    // Obtener cócteles
    const { data: cocktails, error: cocktailsError } = await supabase
      .from("cocktails")
      .select("id, name")
      .limit(3);

    if (cocktailsError) {
      console.error("❌ Error getting cocktails:", cocktailsError);
      return;
    }

    console.log("🍹 Cocktails found:");
    cocktails.forEach(cocktail => {
      console.log(`  - ${cocktail.name}: ${cocktail.id}`);
    });

    // Obtener tamaños
    const { data: sizes, error: sizesError } = await supabase
      .from("sizes")
      .select("id, name")
      .limit(3);

    if (sizesError) {
      console.error("❌ Error getting sizes:", sizesError);
      return;
    }

    console.log("📏 Sizes found:");
    sizes.forEach(size => {
      console.log(`  - ${size.name}: ${size.id}`);
    });

    // Obtener cocktail_sizes
    const { data: cocktailSizes, error: cocktailSizesError } = await supabase
      .from("cocktail_sizes")
      .select("cocktail_id, sizes_id, stock_quantity")
      .limit(3);

    if (cocktailSizesError) {
      console.error("❌ Error getting cocktail_sizes:", cocktailSizesError);
      return;
    }

    console.log("🍹📏 Cocktail-Size combinations found:");
    cocktailSizes.forEach(cs => {
      console.log(
        `  - Cocktail ${cs.cocktail_id}, Size ${cs.sizes_id}, Stock: ${cs.stock_quantity}`
      );
    });

    // Generar comando de prueba
    if (cocktails.length > 0 && sizes.length > 0) {
      console.log("\n🧪 Test command:");
      console.log(
        `curl -s -X POST http://localhost:3000/api/create-order -H "Content-Type: application/json" -d '{"items":[{"cocktail_id":"${cocktails[0].id}","size_id":"${sizes[0].id}","quantity":1,"unit_price":500}],"total":605,"user_id":null,"shipping_address":{"city":"Madrid"},"payment_intent_id":"pi_test_123"}' | jq .`
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

getRealCocktails();

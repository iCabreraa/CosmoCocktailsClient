require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testOrdersInsert() {
  console.log("🧪 Testing orders table insert...");

  try {
    // Intentar insertar sin payment_intent_id primero
    console.log("1️⃣ Testing insert without payment_intent_id...");
    const { data: order1, error: error1 } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        total_amount: 100.5,
        status: "pending",
        shipping_address: JSON.stringify({ city: "Madrid" }),
      })
      .select()
      .single();

    if (error1) {
      console.log("❌ Error without payment_intent_id:", error1.message);
    } else {
      console.log("✅ Success without payment_intent_id:", order1.id);
    }

    // Intentar insertar con payment_intent_id
    console.log("2️⃣ Testing insert with payment_intent_id...");
    const { data: order2, error: error2 } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        total_amount: 100.5,
        status: "pending",
        payment_intent_id: "pi_test_123",
        shipping_address: JSON.stringify({ city: "Madrid" }),
      })
      .select()
      .single();

    if (error2) {
      console.log("❌ Error with payment_intent_id:", error2.message);

      // Si el error es que no existe la columna, la agregamos
      if (error2.message.includes("payment_intent_id")) {
        console.log("🔧 Column payment_intent_id does not exist. Adding it...");

        // Usar SQL directo para agregar la columna
        const { error: alterError } = await supabase
          .from("orders")
          .select("*")
          .limit(0); // Esto nos dará la estructura actual

        console.log(
          "📝 Note: You need to add the payment_intent_id column manually in Supabase dashboard"
        );
        console.log(
          "   SQL: ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;"
        );
      }
    } else {
      console.log("✅ Success with payment_intent_id:", order2.id);
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

testOrdersInsert();

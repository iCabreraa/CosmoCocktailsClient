require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrdersTable() {
  console.log("🔍 Checking orders table structure...");

  try {
    // Verificar estructura actual
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "orders")
      .order("ordinal_position");

    if (columnsError) {
      console.error("❌ Error checking columns:", columnsError);
      return;
    }

    console.log("📊 Current orders table structure:");
    columns.forEach(col => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      );
    });

    // Verificar si payment_intent_id existe
    const hasPaymentIntentId = columns.some(
      col => col.column_name === "payment_intent_id"
    );

    if (!hasPaymentIntentId) {
      console.log("🔧 Adding payment_intent_id column...");

      // Agregar la columna usando SQL directo
      const { error: alterError } = await supabase.rpc("exec_sql", {
        sql: "ALTER TABLE orders ADD COLUMN payment_intent_id TEXT;",
      });

      if (alterError) {
        console.error("❌ Error adding column:", alterError);
        // Intentar método alternativo
        console.log("🔄 Trying alternative method...");

        // Crear una nueva tabla temporal con la estructura correcta
        const { error: createError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS orders_new (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES users(id),
              total_amount DECIMAL(10,2) NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              payment_intent_id TEXT,
              shipping_address JSONB,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
        });

        if (createError) {
          console.error("❌ Error creating new table:", createError);
        } else {
          console.log(
            "✅ New orders table created with payment_intent_id column"
          );
        }
      } else {
        console.log("✅ payment_intent_id column added successfully");
      }
    } else {
      console.log("✅ payment_intent_id column already exists");
    }

    // Verificar estructura final
    const { data: finalColumns, error: finalError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_name", "orders")
      .order("ordinal_position");

    if (!finalError) {
      console.log("📊 Final orders table structure:");
      finalColumns.forEach(col => {
        console.log(
          `  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

fixOrdersTable();

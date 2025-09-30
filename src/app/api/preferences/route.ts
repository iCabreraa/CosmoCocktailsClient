import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: prefRow } = await supabase
      .from("user_preferences")
      .select("language, currency")
      .eq("user_id", user.id)
      .single();

    // Theme vive en users_new.preferences JSONB
    const { data: usersRow } = await supabase
      .from("users_new")
      .select("preferences")
      .eq("id", user.id)
      .single();

    const theme = usersRow?.preferences?.theme ?? "light";
    const language = prefRow?.language ?? "es";
    const currency = prefRow?.currency ?? "EUR";

    return NextResponse.json({ preferences: { theme, language, currency } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { theme, language } = body || {};

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1) Guardar theme en users_new.preferences JSONB (merge)
    if (theme) {
      const { data: current } = await supabase
        .from("users_new")
        .select("preferences")
        .eq("id", user.id)
        .single();

      const merged = { ...(current?.preferences || {}), theme };
      // @ts-expect-error - Supabase types issue in build environments
      const { error: upErr1 } = await (supabase as any)
        .from("users_new")
        .update({ preferences: merged })
        .eq("id", user.id);
      if (upErr1)
        return NextResponse.json({ error: upErr1.message }, { status: 500 });
    }

    // 2) Guardar language/currency en user_preferences (currency fijo a EUR)
    // @ts-expect-error - Supabase types issue in build environments
    const { error: upErr2 } = await (supabase as any)
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          language: language ?? "es",
          currency: "EUR",
        },
        { onConflict: "user_id" }
      );
    if (upErr2)
      return NextResponse.json({ error: upErr2.message }, { status: 500 });

    return NextResponse.json({
      preferences: { theme, language, currency: "EUR" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

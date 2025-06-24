import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, ...rest } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from("users")
      .insert({ email, password: hashed, ...rest })
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { password: _pw, ...safeUser } = (data as any) ?? {};
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

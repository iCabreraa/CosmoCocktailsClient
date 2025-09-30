import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      full_name,
      phone,
      avatar_url,
      role = "client",
      ...rest
    } = await request.json();
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password and full_name are required" },
        { status: 400 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await (supabase as any)
      .from("users")
      .insert({
        email,
        password: hashed,
        full_name,
        phone,
        avatar_url,
        role,
        ...rest,
      })
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

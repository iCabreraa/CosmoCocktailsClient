import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseClient";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    const { password, ...safeUser } = user as any;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const updates = await request.json();
    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", decoded.id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const { password, ...safeUser } = user as any;
    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

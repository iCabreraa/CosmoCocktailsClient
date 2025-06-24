import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseClient";

const secret = process.env.JWT_SECRET || "secret-key";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }
    const decoded = jwt.verify(token, secret) as { id: string };
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

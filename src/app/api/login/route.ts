import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rateLimiter";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          resetTime: rateLimit.resetTime 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
    cookies().set("token", token, { httpOnly: true, sameSite: "lax" });
    const { password: _pw, ...safeUser } = user as any;
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

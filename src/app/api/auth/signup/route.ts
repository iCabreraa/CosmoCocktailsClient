import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserService } from "@/lib/services/user.service";

const userService = new UserService();

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password and full_name are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
        },
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // 2. Crear perfil en users_new
    try {
      const userProfile = await userService.createUser({
        id: authData.user.id,
        email: authData.user.email!,
        full_name,
        phone,
        role: "customer",
        status: "active",
        preferences: {},
        metadata: {},
      });

      console.log("✅ User profile created:", userProfile.id);

      return NextResponse.json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          phone,
          role: "customer",
          status: "active",
        },
        message:
          "User created successfully. Please check your email to confirm your account.",
      });
    } catch (profileError) {
      console.error("Profile creation error:", profileError);

      // Si falla la creación del perfil, eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

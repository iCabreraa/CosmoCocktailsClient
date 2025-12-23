import { NextRequest, NextResponse } from "next/server";
import { UserService } from "../../../lib/services/user.service";
import { getAuthContext } from "@/lib/security/auth";

const userService = new UserService();

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const role = searchParams.get("role") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const filters = {
      ...(role && { role: role as any }),
      ...(status && { status: status as any }),
      ...(search && { search }),
    };

    const result = await userService.getUsers(page, limit, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!auth.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const user = await userService.createUser(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

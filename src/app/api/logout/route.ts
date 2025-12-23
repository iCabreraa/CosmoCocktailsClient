import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete({ name: "token", path: "/" });
  return NextResponse.json({ message: "Logged out" });
}

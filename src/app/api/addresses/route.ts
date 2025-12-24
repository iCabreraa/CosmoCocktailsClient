import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const getAddressPayload = (body: any) => {
  return {
    name: String(body?.name ?? "").trim(),
    street: String(body?.street ?? body?.address_line_1 ?? "").trim(),
    city: String(body?.city ?? "").trim(),
    postal_code: String(body?.postal_code ?? body?.postalCode ?? "").trim(),
    country: String(body?.country ?? "").trim(),
    phone: body?.phone ? String(body.phone).trim() : null,
    is_default: Boolean(body?.is_default ?? body?.isDefault ?? false),
    type: body?.type ?? "shipping",
  };
};

const validatePayload = (payload: ReturnType<typeof getAddressPayload>) => {
  const missing = [];
  if (!payload.name) missing.push("name");
  if (!payload.street) missing.push("street");
  if (!payload.city) missing.push("city");
  if (!payload.postal_code) missing.push("postal_code");
  if (!payload.country) missing.push("country");
  return missing;
};

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const payload = getAddressPayload(body);
  const missing = validatePayload(payload);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (payload.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({
      user_id: user.id,
      ...payload,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const addressId = body?.id;
  if (!addressId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const payload = getAddressPayload(body);
  const missing = validatePayload(payload);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (payload.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", addressId);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("id", addressId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ address: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get("id");
  if (!addressId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("user_id", user.id)
    .eq("id", addressId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

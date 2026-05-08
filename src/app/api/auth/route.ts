import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    admin: {
      id: data.id,
      name: data.name,
      email: data.email,
      is_super: data.is_super || false,
    },
    token: Buffer.from(`${email}:${Date.now()}`).toString("base64"),
  });
}

export async function GET() {
  const { data, error } = await supabase
    .from("admins")
    .select("id, name, email, is_super, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { data: target } = await supabase
    .from("admins")
    .select("is_super")
    .eq("id", id)
    .single();

  if (target?.is_super) {
    return NextResponse.json(
      { error: "Admin utama tidak bisa dihapus" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("admins").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

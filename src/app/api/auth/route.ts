import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword, generateToken, verifyAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  const hashed = hashPassword(password);
  const isPasswordMatch = data.password === hashed || data.password === password;

  if (!isPasswordMatch) {
    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  }

  // Upgrade plaintext password ke hash (transisi keamanan)
  if (data.password === password) {
    await supabase.from("admins").update({ password: hashed }).eq("id", data.id);
  }

  const token = generateToken();

  await supabase.from("admins").update({ token }).eq("id", data.id);

  return NextResponse.json({
    success: true,
    admin: {
      id: data.id,
      name: data.name,
      email: data.email,
      is_super: data.is_super || false,
    },
    token,
  });
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

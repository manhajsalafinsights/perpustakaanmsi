import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";
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
    const svc = createServiceClient();
    await svc.from("admins").update({ password: hashed }).eq("id", data.id);
  }

  const token = generateToken();

  const svc = createServiceClient();
  const { error: updateErr } = await svc.from("admins").update({ token }).eq("id", data.id);
  if (updateErr) {
    return NextResponse.json(
      { error: "Gagal menyimpan token: " + updateErr.message },
      { status: 500 }
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
    token,
  });
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("admins")
    .select("id, name, email, is_super, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current password dan new password wajib diisi" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
  }

  const { data: adminData } = await supabase
    .from("admins")
    .select("password")
    .eq("id", admin.id)
    .single();

  if (!adminData) {
    return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
  }

  const hashedCurrent = hashPassword(currentPassword);
  const isMatch = adminData.password === hashedCurrent || adminData.password === currentPassword;

  if (!isMatch) {
    return NextResponse.json({ error: "Password saat ini salah" }, { status: 403 });
  }

  const hashedNew = hashPassword(newPassword);
  const svc = createServiceClient();
  const { error } = await svc.from("admins").update({ password: hashedNew }).eq("id", admin.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Password berhasil diubah" });
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

  const svc = createServiceClient();
  const { error } = await svc.from("admins").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

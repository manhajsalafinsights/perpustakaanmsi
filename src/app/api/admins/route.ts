import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyAdmin, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password, requester_is_super } = await request.json();

  if (!admin.is_super) {
    return NextResponse.json(
      { error: "Hanya admin utama yang bisa menambah admin" },
      { status: 403 }
    );
  }

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, dan password wajib diisi" },
      { status: 400 }
    );
  }

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("admins")
    .insert([{ name, email, password: hashPassword(password), is_super: false }])
    .select("id, name, email, is_super, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

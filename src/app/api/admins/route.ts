import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { name, email, password, requester_is_super } = await request.json();

  if (!requester_is_super) {
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

  const { data, error } = await supabase
    .from("admins")
    .insert([{ name, email, password, is_super: false }])
    .select("id, name, email, is_super, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

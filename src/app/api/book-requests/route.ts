import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";

async function verifyAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) return null;
  const decoded = Buffer.from(auth, "base64").toString();
  const [email] = decoded.split(":");
  if (!email) return null;
  const { data } = await supabase
    .from("admins")
    .select("id, name, email, is_super")
    .eq("email", email)
    .single();
  return data;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, author, description, name, email } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Judul buku wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("book_requests")
    .insert([
      {
        title: title.trim(),
        author: author?.trim() || null,
        description: description?.trim() || null,
        name: name?.trim() || null,
        email: email?.trim() || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";

  let query = supabase
    .from("book_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "ID dan status wajib diisi" }, { status: 400 });
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("book_requests")
    .update({ status, updated_by: admin.id })
    .eq("id", id)
    .select()
    .single();

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

  const { error } = await supabase.from("book_requests").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

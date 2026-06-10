import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";

const db = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceKey ? createServiceClient() : supabase;
};

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
  const { title, author, description, category, cover_url, file_url, name, email } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Judul buku wajib diisi" }, { status: 400 });
  }
  if (!file_url || !file_url.trim()) {
    return NextResponse.json({ error: "Link Google Drive wajib diisi" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("book_recommendations")
    .insert([
      {
        title: title.trim(),
        author: author?.trim() || null,
        description: description?.trim() || null,
        category: category?.trim() || null,
        cover_url: cover_url?.trim() || null,
        file_url: file_url.trim(),
        status: "pending",
        name: name?.trim() || null,
        email: email?.trim() || null,
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
    .from("book_recommendations")
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

  if (status === "approved") {
    const { data: rec, error: recError } = await supabase
      .from("book_recommendations")
      .select("*")
      .eq("id", id)
      .single();

    if (recError || !rec) {
      return NextResponse.json({ error: "Rekomendasi tidak ditemukan" }, { status: 404 });
    }

    let recCover = rec.cover_url || "";
    if (!recCover && rec.file_url) {
      const m = rec.file_url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
        || rec.file_url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
      if (m) recCover = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
    }

    const { data: book, error: bookError } = await db()
      .from("books")
      .insert([
        {
          title: rec.title,
          description: rec.description || "",
          cover_url: recCover,
          file_url: rec.file_url,
          category: rec.category || "Umum",
          author: rec.author || "",
          price: 25000,
          promo_price: null,
          promo_text: "",
          views: 0,
          purchased: 0,
          downloads: 0,
        },
      ])
      .select()
      .single();

    if (bookError) {
      return NextResponse.json({ error: bookError.message }, { status: 500 });
    }

    await db()
      .from("book_volumes")
      .insert([
        {
          book_id: book.id,
          title: "Jilid 1",
          file_url: rec.file_url,
        },
      ])
      .then(() => {});

    const { data: updated, error: updateError } = await db()
      .from("book_recommendations")
      .update({ status: "approved" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  }

  const { data, error } = await db()
    .from("book_recommendations")
    .update({ status })
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

  const { error } = await db().from("book_recommendations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

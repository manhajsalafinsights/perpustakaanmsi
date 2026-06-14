import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";

const db = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceKey ? createServiceClient() : supabase;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const id = searchParams.get("id") || "";
  const includeVolumes = searchParams.get("include_volumes") === "true";
  const isAdmin = searchParams.get("admin") === "true";

  let selectQuery = "*, comments(count)";
  if (includeVolumes) {
    selectQuery = "*, comments(count), volumes:*";
  }

  if (id) {
    const { data, error } = await supabase
      .from("books")
      .select("*, comments(count)")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (includeVolumes) {
      const { data: volumes } = await supabase
        .from("book_volumes")
        .select("*")
        .eq("book_id", id)
        .order("created_at", { ascending: true });

      (data as Record<string, unknown>).volumes = volumes || [];
    }

    return NextResponse.json(data);
  }

  let query = supabase
    .from("books")
    .select(selectQuery)
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.in("status", ["published", "scheduled"]);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { volumes, ...bookData } = body;

  let cover = bookData.cover_url || "";
  if (!cover && volumes?.[0]?.file_url) {
    const m = String(volumes[0].file_url).match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
      || String(volumes[0].file_url).match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
    if (m) cover = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  }

  const { data, error } = await db()
    .from("books")
    .insert([
      {
        title: bookData.title,
        description: bookData.description || "",
        cover_url: cover,
        file_url: bookData.file_url || "",
        category: bookData.category || "Umum",
        author: bookData.author || "",
        translator: bookData.translator || "",
        is_paid: bookData.is_paid || false,
        status: bookData.status || "published",
        scheduled_at: bookData.scheduled_at || null,
        published_at: bookData.status === "published" ? new Date().toISOString() : null,
        price: bookData.price || 25000,
        promo_price: bookData.promo_price || null,
        promo_text: bookData.promo_text || "",
        views: bookData.views || 0,
        purchased: bookData.purchased || 0,
        downloads: bookData.downloads || 0,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (volumes && volumes.length > 0) {
    try {
      const volumeRows = volumes.map((v: { title: string; file_url: string }) => ({
        book_id: data.id,
        title: v.title || "Jilid 1",
        file_url: v.file_url || "",
      }));

      await db().from("book_volumes").insert(volumeRows);
    } catch {
      // book_volumes table may not exist yet
    }
  }

  let fullData = data;
  try {
    const { data: vols } = await supabase
      .from("book_volumes")
      .select("*")
      .eq("book_id", data.id);
    fullData = { ...data, volumes: vols || [] };
  } catch {
    // fallback
  }

  return NextResponse.json(fullData, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, volumes, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  if (!updates.cover_url && volumes?.[0]?.file_url) {
    const m = String(volumes[0].file_url).match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
      || String(volumes[0].file_url).match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
    if (m) updates.cover_url = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  }

  if (updates.status === "published" && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }

  const { data, error } = await db()
    .from("books")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (volumes && Array.isArray(volumes)) {
    try {
      await db().from("book_volumes").delete().eq("book_id", id);

      if (volumes.length > 0) {
        const volumeRows = volumes.map((v: { title: string; file_url: string }) => ({
          book_id: id,
          title: v.title || "Jilid 1",
          file_url: v.file_url || "",
        }));

        await db().from("book_volumes").insert(volumeRows);
      }
    } catch {
      // book_volumes table may not exist yet
    }
  }

  let fullData = data;
  try {
    const { data: vols } = await supabase
      .from("book_volumes")
      .select("*")
      .eq("book_id", id);
    fullData = { ...data, volumes: vols || [] };
  } catch {
    // fallback
  }

  return NextResponse.json(fullData);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await db().from("book_volumes").delete().eq("book_id", id);
  } catch {
    // book_volumes table may not exist yet
  }

  const { error } = await db().from("books").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

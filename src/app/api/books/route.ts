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

  let selectQuery = "*, comments(count)";
  if (includeVolumes) {
    selectQuery = "*, comments(count), volumes:*";
  }

  if (id) {
    const { data, error } = await supabase
      .from("books")
      .select(selectQuery)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  }

  if (!includeVolumes) {
    selectQuery = "*, comments(count), volumes:book_volumes(count)";
  }

  let query = supabase
    .from("books")
    .select(selectQuery)
    .order("created_at", { ascending: false });

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

  const { data, error } = await db()
    .from("books")
    .insert([
      {
        title: bookData.title,
        description: bookData.description || "",
        cover_url: bookData.cover_url || "",
        file_url: bookData.file_url || "",
        category: bookData.category || "Umum",
        author: bookData.author || "",
        is_paid: bookData.is_paid || false,
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
    const volumeRows = volumes.map((v: { title: string; file_url: string }) => ({
      book_id: data.id,
      title: v.title || "Jilid 1",
      file_url: v.file_url || "",
    }));

    const { error: volError } = await db()
      .from("book_volumes")
      .insert(volumeRows);

    if (volError) {
      return NextResponse.json({ error: volError.message }, { status: 500 });
    }
  }

  const { data: fullData } = await supabase
    .from("books")
    .select("*, volumes:*")
    .eq("id", data.id)
    .single();

  return NextResponse.json(fullData || data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, volumes, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
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
    await db().from("book_volumes").delete().eq("book_id", id);

    if (volumes.length > 0) {
      const volumeRows = volumes.map((v: { title: string; file_url: string }) => ({
        book_id: id,
        title: v.title || "Jilid 1",
        file_url: v.file_url || "",
      }));

      const { error: volError } = await db()
        .from("book_volumes")
        .insert(volumeRows);

      if (volError) {
        return NextResponse.json({ error: volError.message }, { status: 500 });
      }
    }
  }

  const { data: fullData } = await supabase
    .from("books")
    .select("*, volumes:*")
    .eq("id", id)
    .single();

  return NextResponse.json(fullData || data);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await db().from("book_volumes").delete().eq("book_id", id);

  const { error } = await db().from("books").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

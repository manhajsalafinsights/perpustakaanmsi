import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/auth";
import { Book } from "@/lib/types";

const db = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceKey ? createServiceClient() : supabase;
};

export async function GET(request: NextRequest) {
  await db()
    .from("books")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString());

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const id = searchParams.get("id") || "";
  const exclude = searchParams.get("exclude") || "";
  const relatedLimit = parseInt(searchParams.get("related_limit") || "0");
  const includeVolumes = searchParams.get("include_volumes") === "true";
  const isAdmin = searchParams.get("admin") === "true";
  const isPaid = searchParams.get("is_paid"); // "true" or undefined
  const status = searchParams.get("status") || "";
  const featured = searchParams.get("featured") === "true";

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

  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "0");

  let base = supabase.from("books").select(selectQuery, page ? { count: "exact" } : undefined);

  if (!isAdmin) {
    base = base.in("status", ["published", "scheduled"]);
  }

  if (search) {
    base = base.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
    );
  }

  if (category) {
    base = base.eq("category", category);
  }

  if (exclude) {
    base = base.neq("id", exclude);
  }

  if (isPaid === "true") {
    base = base.eq("is_paid", true);
  }

  if (isAdmin && status) {
    base = base.eq("status", status);
  }

  if (featured) {
    base = base.eq("is_featured", true);
  }

  base = base.order("created_at", { ascending: false });

  if (featured) {
    base = base.limit(1);
  }

  if (relatedLimit > 0) {
    base = base.limit(relatedLimit);
  }

  if (page && limit) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    base = base.range(from, to);
  }

  const { data, error, count } = await base;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (featured) {
    return NextResponse.json((data as unknown as Book[] | null)?.[0] ?? null);
  }

  if (page) {
    return NextResponse.json({
      data,
      total: count || 0,
      page,
      totalPages: limit ? Math.ceil((count || 0) / limit) : 1,
    });
  }

  return NextResponse.json(data);
}

function randomViewCount(): number {
  const rand = Math.random();
  if (rand < 0.2) return Math.floor(Math.random() * 999) + 50;
  if (rand < 0.45) return Math.floor(Math.random() * 9000) + 1000;
  if (rand < 0.7) return Math.floor(Math.random() * 90000) + 10000;
  if (rand < 0.9) return Math.floor(Math.random() * 900000) + 100000;
  return Math.floor(Math.random() * 5000000) + 1000000;
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { volumes, ...bookData } = body;

  let cover = bookData.cover_url || "";
  if (!cover && volumes?.[0]?.file_url) {
    const m = String(volumes[0].file_url).match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
      || String(volumes[0].file_url).match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
    if (m) cover = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
  }

  if (bookData.is_featured) {
    await db().from("books").update({ is_featured: false }).eq("is_featured", true);
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
        page_count: bookData.page_count || 0,
        views: bookData.views ?? randomViewCount(),
        purchased: bookData.purchased || 0,
        downloads: bookData.downloads || 0,
        is_featured: bookData.is_featured || false,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (volumes && volumes.length > 0) {
    try {
      const volumeRows = volumes.map((v: { title: string; file_url: string; page_count?: number }) => ({
        book_id: data.id,
        title: v.title || "Jilid 1",
        file_url: v.file_url || "",
        page_count: v.page_count || 0,
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
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

  if (!updates.scheduled_at || updates.status !== "scheduled") {
    updates.scheduled_at = null;
  }
  if (!updates.promo_price) {
    updates.promo_price = null;
  }

  if (updates.is_featured === true) {
    await db().from("books").update({ is_featured: false }).eq("is_featured", true);
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
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

import { NextRequest, NextResponse } from "next/server";
import { supabase, createServiceClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/auth";

const db = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceKey ? createServiceClient() : supabase;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book_id");

  if (!bookId || bookId === "all") {
    const { data, error } = await supabase
      .from("comments")
      .select("*, books(title)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { book_id, name, message, rating } = await request.json();

  if (!book_id || !name || !message) {
    return NextResponse.json(
      { error: "book_id, name, and message are required" },
      { status: 400 }
    );
  }

  const parsedRating = parseInt(rating, 10);
  const safeRating = isNaN(parsedRating) ? 0 : Math.min(5, Math.max(0, parsedRating));

  const { data, error } = await supabase
    .from("comments")
    .insert([{ book_id, name, message, rating: safeRating }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await db().from("comments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

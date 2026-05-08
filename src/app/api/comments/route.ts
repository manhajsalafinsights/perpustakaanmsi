import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book_id");

  if (!bookId) {
    return NextResponse.json({ error: "book_id is required" }, { status: 400 });
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
  const { book_id, name, message } = await request.json();

  if (!book_id || !name || !message) {
    return NextResponse.json(
      { error: "book_id, name, and message are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert([{ book_id, name, message }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

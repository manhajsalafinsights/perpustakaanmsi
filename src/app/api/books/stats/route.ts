import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, type } = body;

  if (!id || !type) {
    return NextResponse.json({ error: "id and type are required" }, { status: 400 });
  }

  const validTypes = ["views", "downloads", "purchased", "donations"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const client = createServiceClient();

  const { data: current, error: fetchError } = await client
    .from("books")
    .select(type)
    .eq("id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 });
  }

  const increment = type === "views" ? Math.floor(Math.random() * 5) + 1 : 1;
  const newValue = (Number(current?.[type]) || 0) + increment;

  const { data: updated, error: updateError } = await client
    .from("books")
    .update({ [type]: newValue })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

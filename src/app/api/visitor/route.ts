import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { count, error } = await supabase
    .from("visitors")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count || 0 });
}

export async function POST() {
  const { error } = await supabase.from("visitors").insert({});

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

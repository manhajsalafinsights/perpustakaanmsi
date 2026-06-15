import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const sql = `
    ALTER TABLE books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
    ALTER TABLE books ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
  `;

  const { error } = await supabase.rpc("exec_sql", { sql });
  if (error) {
    // Try creating the function first
    const { error: e2 } = await supabase.rpc("exec", { query: sql });
    if (e2) {
      return NextResponse.json({ error: e2.message, hint: "Run SQL manually via Supabase dashboard" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

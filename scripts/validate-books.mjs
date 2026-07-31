import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(join(root, ".env.local"), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

function extractFileId(url) {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return driveMatch[1];
  const exportMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (exportMatch) return exportMatch[1];
  return null;
}

async function checkPdf(url) {
  const fileId = extractFileId(url);
  const target = fileId
    ? `https://drive.google.com/uc?export=download&id=${fileId}`
    : url;
  try {
    const r = await fetch(target, {
      headers: { Range: "bytes=0-4" },
      signal: AbortSignal.timeout(20000),
    });
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.toString("latin1").startsWith("%PDF");
  } catch (e) {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { data: books, error } = await client
  .from("books")
  .select("id,title,status,is_paid,file_url,published_at,created_at")
  .in("status", ["published", "scheduled"])
  .order("created_at", { ascending: false });

if (error) {
  console.error("Gagal ambil buku:", error.message);
  process.exit(1);
}

const { data: volumes } = await client
  .from("book_volumes")
  .select("book_id,title,file_url");

let broken = 0;
let ok = 0;

for (const b of books) {
  const vols = (volumes || []).filter((v) => v.book_id === b.id);
  const entries = [
    { label: "buku", url: b.file_url },
    ...vols.map((v) => ({ label: `jilid "${v.title}"`, url: v.file_url })),
  ].filter((e) => e.url);

  if (entries.length === 0) {
    console.log(`SKIP\t${b.status}\t${b.title}\t(tidak ada file)`);
    continue;
  }

  for (const e of entries) {
    const valid = await checkPdf(e.url);
    if (valid) {
      ok++;
      console.log(`OK  \t${b.status}\t${b.title}\t${e.label}`);
    } else {
      broken++;
      console.log(`RUSAK\t${b.status}\t${b.title}\t${e.label}\t${e.url}`);
    }
    await sleep(1500);
  }
}

console.log(`\nRangkuman: ${ok} file OK, ${broken} file rusak.`);
process.exit(broken > 0 ? 1 : 0);

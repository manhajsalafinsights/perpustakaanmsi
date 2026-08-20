import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { supabase, createServiceClient } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/auth";

const MAX_FREE_PAGES = 10;
const CACHE_TTL = 30 * 60 * 1000;

const previewCache = new Map<string, { bytes: Uint8Array; at: number }>();

function db() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return serviceKey ? createServiceClient() : supabase;
}

function extractFileId(url: string): string | null {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return driveMatch[1];
  const exportMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (exportMatch) return exportMatch[1];
  return null;
}

async function fetchPdfStream(fileId: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await fetch(downloadUrl);

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      const html = await response.text();
      const confirmMatch = html.match(/confirm=([^&\s"']+)/);
      if (confirmMatch) {
        const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
        const confirmResponse = await fetch(confirmUrl);
        return confirmResponse;
      }
    }

    if (
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream") ||
      contentType.includes("binary") ||
      response.ok
    ) {
      return response;
    }

    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  return null;
}

async function buildPreview(fileId: string): Promise<Uint8Array | null> {
  const response = await fetchPdfStream(fileId);
  if (!response) return null;
  const bytes = new Uint8Array(await response.arrayBuffer());
  try {
    const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const limit = Math.min(MAX_FREE_PAGES, source.getPageCount());
    const indices: number[] = [];
    for (let i = 0; i < limit; i++) indices.push(i);
    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, indices);
    pages.forEach((p) => output.addPage(p));
    return await output.save();
  } catch {
    return null;
  }
}

function pdfResponse(body: BodyInit | null): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart]);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get("book_id");
  const volumeId = searchParams.get("volume_id") || "";
  const rawUrl = searchParams.get("url");

  if (!bookId && !rawUrl) {
    return NextResponse.json({ error: "URL atau book_id diperlukan" }, { status: 400 });
  }

  // Raw URL is only allowed for authenticated admins (used by admin auto-extract).
  if (rawUrl && !bookId) {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const fileId = extractFileId(rawUrl);
    if (!fileId) {
      const directResponse = await fetch(rawUrl);
      return pdfResponse(directResponse.body);
    }
    const stream = await fetchPdfStream(fileId);
    if (!stream) return NextResponse.json({ error: "Gagal mengunduh PDF" }, { status: 502 });
    return pdfResponse(stream.body);
  }

  const { data: book, error: bookError } = await db()
    .from("books")
    .select("id,is_paid,status,file_url")
    .eq("id", bookId)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
  }
  if (book.status === "draft") {
    return NextResponse.json({ error: "Buku tidak tersedia" }, { status: 404 });
  }

  const isPaid = !!book.is_paid;
  let fileUrl = book.file_url || "";

  if (volumeId) {
    const { data: vol } = await db()
      .from("book_volumes")
      .select("file_url")
      .eq("id", volumeId)
      .eq("book_id", bookId)
      .single();
    if (vol?.file_url) fileUrl = vol.file_url;
  }

  if (!fileUrl) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  const fileId = extractFileId(fileUrl);
  if (!fileId) {
    if (isPaid) {
      return NextResponse.json({ error: "Preview tidak tersedia" }, { status: 403 });
    }
    const directResponse = await fetch(fileUrl);
    return pdfResponse(directResponse.body);
  }

  if (!isPaid) {
    const stream = await fetchPdfStream(fileId);
    if (!stream) return NextResponse.json({ error: "Gagal mengunduh PDF" }, { status: 502 });
    return pdfResponse(stream.body);
  }

  // Paid book: serve only the first MAX_FREE_PAGES pages, never the full PDF.
  const cacheKey = `${bookId}:${volumeId || "main"}`;
  const cached = previewCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return pdfResponse(pdfBlob(cached.bytes));
  }

  const preview = await buildPreview(fileId);
  if (!preview) {
    return NextResponse.json({ error: "Gagal menyiapkan preview" }, { status: 502 });
  }

  if (previewCache.size > 60) previewCache.clear();
  previewCache.set(cacheKey, { bytes: preview, at: Date.now() });
  return pdfResponse(pdfBlob(preview));
}

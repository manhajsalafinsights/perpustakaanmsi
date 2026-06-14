import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

function parseFilename(disposition: string | null): string {
  if (!disposition) return "";
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"'\n;]+)["']?/i);
  if (match) {
    let name = match[1].trim();
    name = decodeURIComponent(name.replace(/\+/g, " "));
    return name.replace(/\.pdf$/i, "").trim();
  }
  return "";
}

async function fetchWithFilename(url: string): Promise<{ bytes: Uint8Array; filename: string }> {
  const response = await fetch(url);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const filename = parseFilename(response.headers.get("content-disposition"));

  if (bytes.length < 1000 && response.headers.get("content-type")?.includes("text/html")) {
    const html = new TextDecoder().decode(bytes);
    const confirmMatch = html.match(/confirm=([^&\s"']+)/);
    if (confirmMatch) {
      const confirmUrl = `${url}&confirm=${confirmMatch[1]}`;
      const confirmResponse = await fetch(confirmUrl);
      return {
        bytes: new Uint8Array(await confirmResponse.arrayBuffer()),
        filename: parseFilename(confirmResponse.headers.get("content-disposition")),
      };
    }
  }

  return { bytes, filename };
}

async function getPdfBytes(url: string) {
  let fileId = "";
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const exportMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (driveMatch) fileId = driveMatch[1];
  else if (exportMatch) fileId = exportMatch[1];

  if (fileId) {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return fetchWithFilename(downloadUrl);
  }

  return fetchWithFilename(url);
}

function extractTextFromRaw(bytes: Uint8Array): string {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

  const texts: string[] = [];

  const tj = /\(((?:[^()\\]|\\.)*)\)\s*Tj/gi;
  let m;
  while ((m = tj.exec(raw)) !== null) {
    const t = m[1].replace(/\\(.)/g, "$1").replace(/\s+/g, " ").trim();
    if (t && t.length > 3) texts.push(t);
  }

  if (texts.length > 0) return texts.join(" ");

  const tjArr = /\[((?:\s*\([^)]*\)\s*(?:-?\d+\.?\d*)?\s*)*)\]\s*TJ/gi;
  while ((m = tjArr.exec(raw)) !== null) {
    const parts = [...m[1].matchAll(/\(([^)]*)\)/g)];
    const t = parts.map((p) => p[1].replace(/\\(.)/g, "$1")).join("");
    if (t.trim().length > 3) texts.push(t.trim());
  }

  return texts.join(" ").replace(/\s+/g, " ").trim().slice(0, 500);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL diperlukan" }, { status: 400 });
    }

    const { bytes: pdfBytes, filename } = await getPdfBytes(url);

    let title = "";
    let author = "";

    try {
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      title = doc.getTitle() || "";
      author = doc.getAuthor() || "";
    } catch (e) {
      console.error("pdf-lib failed:", e);
    }

    if (!title && filename) {
      title = filename;
    }

    let description = "";
    try {
      const rawText = extractTextFromRaw(pdfBytes);
      const firstSentence = rawText.match(/^.*?[.!?]/);
      description = firstSentence
        ? firstSentence[0] + " Baca selanjutnya..."
        : rawText.slice(0, 200) + (rawText.length > 200 ? " Baca selanjutnya..." : "");
    } catch (e) {
      console.error("text extraction failed:", e);
    }

    if (!title && !author && !description) {
      return NextResponse.json(
        { error: "Tidak bisa mengekstrak metadata dari PDF ini. Kemungkinan file tidak dapat diakses atau bukan PDF." },
        { status: 422 }
      );
    }

    return NextResponse.json({ title, author, description });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal mengekstrak PDF" },
      { status: 500 }
    );
  }
}

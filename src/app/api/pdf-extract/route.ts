import { NextRequest, NextResponse } from "next/server";

async function getPdfBytes(url: string) {
  let fileId = "";
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  const exportMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (driveMatch) fileId = driveMatch[1];
  else if (exportMatch) fileId = exportMatch[1];

  if (fileId) {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const response = await fetch(downloadUrl);

    if (response.headers.get("content-type")?.includes("text/html")) {
      const html = await response.text();
      const confirmMatch = html.match(/confirm=([^&\s"']+)/);
      if (confirmMatch) {
        const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${confirmMatch[1]}&id=${fileId}`;
        const confirmResponse = await fetch(confirmUrl);
        return new Uint8Array(await confirmResponse.arrayBuffer());
      }
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  const directResponse = await fetch(url);
  return new Uint8Array(await directResponse.arrayBuffer());
}

function extractTextFromRaw(bytes: Uint8Array): string {
  const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

  const texts: string[] = [];

  // Tj operator: (text) Tj
  const tj = /\(((?:[^()\\]|\\.)*)\)\s*Tj/gi;
  let m;
  while ((m = tj.exec(raw)) !== null) {
    const t = m[1].replace(/\\(.)/g, "$1").replace(/\s+/g, " ").trim();
    if (t && t.length > 3) texts.push(t);
  }

  if (texts.length > 0) return texts.join(" ");

  // TJ operator: [(text) num (text)] TJ
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

    const pdfBytes = await getPdfBytes(url);

    let title = "";
    let author = "";

    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      title = doc.getTitle() || "";
      author = doc.getAuthor() || "";
    } catch {
      // pdf-lib failed
    }

    let description = "";
    try {
      const rawText = extractTextFromRaw(pdfBytes);
      const firstSentence = rawText.match(/^.*?[.!?]/);
      description = firstSentence
        ? firstSentence[0] + " Baca selanjutnya..."
        : rawText.slice(0, 200) + (rawText.length > 200 ? " Baca selanjutnya..." : "");
    } catch {
      // text extraction failed
    }

    return NextResponse.json({ title, author, description });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal mengekstrak PDF" },
      { status: 500 }
    );
  }
}

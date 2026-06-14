import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function ensurePolyfills() {
  if (typeof globalThis.DOMMatrix === "undefined") {
    try {
      const mod = await import("dommatrix");
      globalThis.DOMMatrix = mod.default as unknown as typeof DOMMatrix;
    } catch {
      // dommatrix not available
    }
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL diperlukan" }, { status: 400 });
    }

    const pdfBytes = await getPdfBytes(url);

    await ensurePolyfills();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    try {
      const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
    } catch {
      pdfjs.GlobalWorkerOptions.workerSrc = "";
    }

    const loadingTask = pdfjs.getDocument({ data: pdfBytes });
    const pdfDoc = await loadingTask.promise;

    const metadata = await pdfDoc.getMetadata();
    const info = metadata.info as Record<string, unknown>;
    const title = typeof info.Title === "string" && info.Title.trim() ? info.Title.trim() : "";
    const author = typeof info.Author === "string" && info.Author.trim() ? info.Author.trim() : "";

    let description = "";
    try {
      const page = await pdfDoc.getPage(1);
      const textContent = await page.getTextContent();
      const fullText = textContent.items
        .map((item: unknown) => (item as { str?: string }).str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      const firstSentence = fullText.match(/^.*?[.!?]/);
      description = firstSentence
        ? firstSentence[0] + " Baca selanjutnya..."
        : fullText.slice(0, 200) + (fullText.length > 200 ? " Baca selanjutnya..." : "");
    } catch {
      // text extraction failed
    }

    await pdfDoc.destroy();

    return NextResponse.json({ title, author, description });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal mengekstrak PDF" },
      { status: 500 }
    );
  }
}

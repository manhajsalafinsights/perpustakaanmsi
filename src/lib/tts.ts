let pdfjsInstance: typeof import("pdfjs-dist") | null = null;

async function getPdfjs() {
  if (!pdfjsInstance) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    pdfjsInstance = pdfjs;
  }
  return pdfjsInstance;
}

export interface TTSChunk {
  index: number;
  text: string;
}

export async function extractPDFText(pdfUrl: string, pageLimit?: number): Promise<string> {
  const pdfjs = await getPdfjs();
  const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
  const pdfDoc = await pdfjs.getDocument(proxyUrl).promise;
  const totalPages = pdfDoc.numPages;
  const maxPages = pageLimit ? Math.min(totalPages, pageLimit) : totalPages;
  const paragraphs: string[] = [];

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const rows: { y: number; items: { x: number; text: string }[] }[] = [];

    for (const item of content.items) {
      const it = item as { str?: string; transform?: number[] };
      if (!it.str || !it.str.trim() || !it.transform) continue;
      const x = Math.round(it.transform[4]);
      const y = Math.round(it.transform[5]);
      let row = rows.find((r) => Math.abs(r.y - y) < 3);
      if (!row) {
        row = { y, items: [] };
        rows.push(row);
      }
      row.items.push({ x, text: it.str });
    }

    rows.sort((a, b) => b.y - a.y);
    const lines = rows
      .map((row) =>
        row.items
          .sort((a, b) => a.x - b.x)
          .map((it) => it.text)
          .join(" "),
      )
      .filter(Boolean);

    const pageText = lines.join("\n").trim();
    if (pageText && !/daftar\s*isi/i.test(pageText) && !/kata\s*pengantar/i.test(pageText)) {
      paragraphs.push(pageText);
    }
  }

  await pdfDoc.destroy();
  return paragraphs.join("\n\n");
}

export function chunkText(text: string): TTSChunk[] {
  const raw = text
    .split(/\n\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 20);

  if (raw.length === 0) return [];

  const result: TTSChunk[] = [];
  for (const p of raw) {
    const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
    for (const s of sentences) {
      const trimmed = s.trim();
      if (trimmed.length > 10) {
        result.push({ index: result.length, text: trimmed });
      }
    }
  }
  return result;
}

export function playChunk(
  text: string,
  onEnd: () => void,
  onError: () => void,
  rate: number = 1,
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError();
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const idVoice = voices.find(
    (v) => v.lang.startsWith("id") || v.lang.startsWith("ms"),
  );
  if (idVoice) utterance.voice = idVoice;

  utterance.onend = onEnd;
  utterance.onerror = onError;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

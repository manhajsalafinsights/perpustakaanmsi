"use client";

export default function TTSPlayer({ pdfUrl, pageLimit, onClose }: { pdfUrl: string; pageLimit?: number; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, background: "red", color: "white", padding: 20, fontSize: 18 }}>
      🔴 TTS PLAYER VISIBLE — {pdfUrl ? "PDF: " + pdfUrl.slice(0, 50) : "NO PDF URL"}
      <button onClick={onClose} style={{ marginLeft: 16, background: "white", color: "black", border: "none", padding: "4px 12px", borderRadius: 4 }}>X</button>
    </div>
  );
}

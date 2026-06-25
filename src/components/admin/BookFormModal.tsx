"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, X, FileText, Tag, BookOpen, Loader2,
} from "lucide-react";
import { Book } from "@/lib/types";

interface BookFormModalProps {
  open: boolean;
  editingBook: Book | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => void;
}

interface Volume {
  title: string;
  file_url: string;
  page_count?: number;
}

function randomViewCount(): number {
  const rand = Math.random();
  if (rand < 0.2) return Math.floor(Math.random() * 999) + 50;
  if (rand < 0.45) return Math.floor(Math.random() * 9000) + 1000;
  if (rand < 0.7) return Math.floor(Math.random() * 90000) + 10000;
  if (rand < 0.9) return Math.floor(Math.random() * 900000) + 100000;
  return Math.floor(Math.random() * 5000000) + 1000000;
}

export default function BookFormModal({ open, editingBook, categories, onClose, onSaved }: BookFormModalProps) {
  const [form, setForm] = useState({
    title: "", description: "", cover_url: "", category: "", author: "", translator: "",
    is_paid: false, status: "published", scheduled_at: "", page_count: 0,
    views: 0, purchased: 0, downloads: 0, price: 25000, promo_price: 0, promo_text: "",
  });
  const [volumes, setVolumes] = useState<Volume[]>([{ title: "Jilid 1", file_url: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const getHeaders = (h?: Record<string, string>) => {
    const token = sessionStorage.getItem("admin_token");
    const base: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (h) Object.assign(base, h);
    return base;
  };

  useEffect(() => {
    if (!open) return;
    if (editingBook) {
      setForm({
        title: editingBook.title,
        description: editingBook.description,
        cover_url: editingBook.cover_url,
        category: editingBook.category,
        author: editingBook.author || "",
        translator: editingBook.translator || "",
        is_paid: editingBook.is_paid || false,
        status: editingBook.status || "published",
        scheduled_at: editingBook.scheduled_at ? editingBook.scheduled_at.slice(0, 10) : "",
        views: editingBook.views || 0,
        purchased: editingBook.purchased || 0,
        downloads: editingBook.downloads || 0,
        price: editingBook.price || 25000,
        promo_price: editingBook.promo_price || 0,
        promo_text: editingBook.promo_text || "",
        page_count: editingBook.page_count || 0,
      });
      setUseCustomCategory(!categories.includes(editingBook.category));
      setCustomCategory(!categories.includes(editingBook.category) ? editingBook.category : "");
      loadVolumes(editingBook);
    } else {
      setForm({ title: "", description: "", cover_url: "", category: "", author: "", translator: "",
        is_paid: false, status: "published", scheduled_at: "", page_count: 0,
        views: 0, purchased: 0, downloads: 0, price: 25000, promo_price: 0, promo_text: "" });
      setVolumes([{ title: "Jilid 1", file_url: "" }]);
      setCustomCategory("");
      setUseCustomCategory(false);
    }
    setExtractMsg(null);
  }, [open, editingBook]);

  const loadVolumes = async (book: Book) => {
    try {
      const res = await fetch(`/api/books?id=${book.id}&include_volumes=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.volumes?.length > 0) {
          setVolumes(data.volumes.map((v: Volume) => ({ title: v.title, file_url: v.file_url })));
          return;
        }
      }
    } catch { /* ignore */ }
    setVolumes(book.file_url ? [{ title: "Jilid 1", file_url: book.file_url }] : [{ title: "Jilid 1", file_url: "" }]);
  };

  const normalizeTitle = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

  const extractClientSide = async (url: string) => {
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
      const pdfDoc = await pdfjs.getDocument(proxyUrl).promise;
      let title = "", author = "", translator = "", description = "";
      let titleFound = false, authorFound = false, translatorFound = false, descFound = false;
      try {
        const pageCount = pdfDoc.numPages;
        const pageTexts: string[] = [];
        for (let i = 2; i <= Math.min(pageCount, 7); i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          const rows: { y: number; items: { x: number; text: string }[] }[] = [];
          for (const item of content.items) {
            const it = item as { str?: string; transform?: number[] };
            if (!it.str || !it.str.trim() || !it.transform) continue;
            const x = Math.round(it.transform[4]);
            const y = Math.round(it.transform[5]);
            let row = rows.find((r) => Math.abs(r.y - y) < 3);
            if (!row) { row = { y, items: [] }; rows.push(row); }
            row.items.push({ x, text: it.str });
          }
          rows.sort((a, b) => b.y - a.y);
          const lines = rows.map((row) => row.items.sort((a, b) => a.x - b.x).map((it) => it.text).join(" "));
          const pageText = lines.join("\n");
          if (pageText.trim() && !/daftar\s*isi/i.test(pageText)) pageTexts.push(pageText);
        }
        const allText = pageTexts.join("\n\n");
        const textLines = allText.split("\n").map((l) => l.trim()).filter(Boolean);
        if (textLines.length > 0) {
          const extractField = (labels: string[], lines: string[]) => {
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const lower = line.toLowerCase();
              for (const label of labels) {
                const idx = lower.indexOf(label);
                if (idx === -1) continue;
                const after = line.slice(idx + label.length).replace(/^[:.\s]+/, "").trim();
                if (after) return after;
                if (i + 1 < lines.length) { const next = lines[i + 1]; if (next && next.length > 0) return next; }
              }
            }
            return "";
          };
          const rawTitle = extractField(["judul buku", "judul asli", "judul kitab", "judul"], textLines);
          if (rawTitle && rawTitle.length > 3 && rawTitle.length < 150) {
            title = normalizeTitle(rawTitle.toLowerCase()).replace(/\[[^\]]*\]/g, "").trim();
            titleFound = true;
          }
          const rawAuthor = extractField(["penulis", "pengarang", "penyusun"], textLines);
          if (rawAuthor) { author = rawAuthor.replace(/\[[^\]]*\]/g, "").trim(); if (author.length > 0) authorFound = true; }
          const rawTranslator = extractField(["penerjemah"], textLines);
          if (rawTranslator) { translator = rawTranslator.replace(/\[[^\]]*\]/g, "").trim(); if (translator.length > 0) translatorFound = true; }
          const rawDesc = extractField(["deskripsi"], textLines);
          if (rawDesc && rawDesc.replace(/[^a-zA-Z0-9\s]/g, "").length > rawDesc.length * 0.5) {
            const ds = rawDesc.match(/^.*?[.!?]/);
            description = ds ? ds[0] + " Baca selanjutnya..." : rawDesc.slice(0, 200) + (rawDesc.length > 200 ? " Baca selanjutnya..." : "");
            if (description.length > 0) descFound = true;
          }
        }
      } catch { /* text extract error */ }
      const totalPages = pdfDoc.numPages;
      await pdfDoc.destroy();
      return { title, author, translator, description, totalPages, titleFound, authorFound, translatorFound, descFound };
    } catch {
      return { title: "", author: "", translator: "", description: "", totalPages: 0, titleFound: false, authorFound: false, translatorFound: false, descFound: false };
    }
  };

  const autoExtract = async (url: string) => {
    if (!url.match(/drive\.google\.com/) || extracting) return;
    setExtracting(true);
    setExtractMsg(null);
    const client = await extractClientSide(url);
    const filled: string[] = [];
    if (client.titleFound) { filled.push("judul"); setForm((prev) => ({ ...prev, title: client.title })); }
    if (client.authorFound) { filled.push("penulis"); setForm((prev) => ({ ...prev, author: client.author })); }
    if (client.translatorFound) { filled.push("penerjemah"); setForm((prev) => ({ ...prev, translator: client.translator })); }
    if (client.descFound) { filled.push("deskripsi"); setForm((prev) => ({ ...prev, description: client.description })); }
    if (client.totalPages > 0) {
      filled.push("halaman");
      setForm((prev) => ({ ...prev, page_count: client.totalPages }));
      setVolumes((prev) => prev.map((v) => v.file_url === url ? { ...v, page_count: client.totalPages } : v));
    }
    setExtracting(false);
    setExtractMsg({ type: filled.length > 0 ? "success" : "error", text: filled.length > 0 ? filled.join(", ") : "Gagal mengekstrak data dari PDF" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validVolumes = volumes.filter((v) => v.file_url.trim());
    if (validVolumes.length === 0) { alert("Minimal satu jilid harus memiliki link download!"); return; }
    if (form.is_paid && form.promo_price > 0 && form.promo_price >= form.price) {
      alert("Harga promo harus lebih kecil dari harga normal!"); return;
    }
    setSubmitting(true);
    let cover = form.cover_url;
    if (!cover && validVolumes[0]?.file_url) {
      const m = validVolumes[0].file_url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
        || validVolumes[0].file_url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
      if (m) cover = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
    }
    try {
      const method = editingBook ? "PUT" : "POST";
      const body: Record<string, unknown> = { ...form, cover_url: cover, volumes: validVolumes };
      if (editingBook) body.id = editingBook.id;
      const res = await fetch("/api/books", {
        method, headers: getHeaders({ "Content-Type": "application/json" }), body: JSON.stringify(body),
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else if (res.status === 401) {
        alert("Sesi habis, silakan login ulang");
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Gagal menyimpan: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)));
    } finally { setSubmitting(false); }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-lg glass rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">{editingBook ? "Edit Buku" : "Tambah Buku Baru"}</h2>
            <button onClick={onClose} className="w-10 h-10 bg-surface-dark rounded-full flex items-center justify-center hover:bg-border transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Judul Buku *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Masukkan judul buku" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Deskripsi</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" placeholder="Deskripsi singkat tentang buku" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Penulis</label>
                <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Nama penulis (pisahkan dengan koma)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Penerjemah</label>
                <input type="text" value={form.translator} onChange={(e) => setForm({ ...form, translator: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Nama penerjemah" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5"><Tag className="w-4 h-4 inline mr-1" />Kategori</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setUseCustomCategory(false); setForm({ ...form, category: "" }); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${!useCustomCategory ? "bg-primary text-white" : "bg-surface text-muted border border-border"}`}>Pilih Kategori</button>
                  <button type="button" onClick={() => { setUseCustomCategory(true); setForm({ ...form, category: customCategory }); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${useCustomCategory ? "bg-primary text-white" : "bg-surface text-muted border border-border"}`}>+ Buat Baru</button>
                </div>
                {!useCustomCategory ? (
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer">
                    <option value="">-- Pilih kategori --</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                ) : (
                  <input type="text" value={customCategory} onChange={(e) => { setCustomCategory(e.target.value); setForm({ ...form, category: e.target.value }); }}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Ketik kategori baru..." />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground">Daftar Jilid *</label>
                <button type="button" onClick={() => setVolumes([...volumes, { title: `Jilid ${volumes.length + 1}`, file_url: "" }])}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Tambah Jilid
                </button>
              </div>
              <div className="space-y-3">
                {volumes.map((vol, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="glass rounded-xl p-3 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-foreground">Jilid {idx + 1}</span>
                      {volumes.length > 1 && (
                        <button type="button" onClick={() => setVolumes(volumes.filter((_, i) => i !== idx))}
                          className="p-1 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input type="text" value={vol.title} onChange={(e) => { const next = [...volumes]; next[idx] = { ...next[idx], title: e.target.value }; setVolumes(next); }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Nama jilid (mis: Jilid 1)" />
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                          <input type="url" value={vol.file_url} onChange={(e) => { const val = e.target.value; const next = [...volumes]; next[idx] = { ...next[idx], file_url: val }; setVolumes(next); }}
                            onPaste={(e) => { const pasted = e.clipboardData.getData("text"); if (idx === 0 && pasted.match(/drive\.google\.com/)) setTimeout(() => autoExtract(pasted), 100); }}
                            onBlur={(e) => { if (idx === 0) autoExtract(e.target.value); }}
                            required className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Link PDF (Google Drive)..." />
                          {idx === 0 && (
                            <button type="button" onClick={() => autoExtract(vol.file_url)} disabled={extracting || !vol.file_url}
                              className="px-2.5 py-2 text-xs font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                              {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Extract"}
                            </button>
                          )}
                        </div>
                        {idx === 0 && extractMsg && (
                          <p className={`text-[11px] ${extractMsg.type === "success" ? "text-green-500" : "text-red-400"}`}>
                            {extractMsg.type === "success" ? `✓ ${extractMsg.text}` : `✗ ${extractMsg.text}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {volumes.filter((v) => v.file_url.trim()).length === 0 && (
                <p className="text-xs text-red-400 mt-1">Minimal satu jilid harus memiliki link download</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status Publikasi</label>
              <div className="flex gap-2 mb-3">
                {(["published", "draft", "scheduled"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                      form.status === s ? (s === "published" ? "bg-green-600 text-white" : s === "draft" ? "bg-surface-dark text-foreground border border-border" : "bg-amber-600 text-white") : "bg-surface text-muted border border-border"
                    }`}>{s === "published" ? "Published" : s === "draft" ? "Draft" : "Scheduled"}</button>
                ))}
              </div>
              {form.status === "scheduled" && (
                <div>
                  <label className="block text-xs text-muted mb-1">Tanggal Launching</label>
                  <input type="date" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status Buku</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm({ ...form, is_paid: false })}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${!form.is_paid ? "bg-green-600 text-white" : "bg-surface text-muted border border-border"}`}>Gratis</button>
                <button type="button" onClick={() => setForm({ ...form, is_paid: true })}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${form.is_paid ? "bg-accent text-white" : "bg-surface text-muted border border-border"}`}>Berbayar</button>
              </div>
              {form.is_paid && (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Harga (Rp)</label>
                    <input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="25000" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Harga Promo (Rp) — kosongkan jika tidak ada promo</label>
                    <input type="number" min={0} value={form.promo_price || ""} onChange={(e) => setForm({ ...form, promo_price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Tulisan Promo (misal: &ldquo;Diskon 50%&rdquo;)</label>
                    <input type="text" value={form.promo_text} onChange={(e) => setForm({ ...form, promo_text: e.target.value })}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Diskon 50%, Ramadhan Sale, dll" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Statistik Buku</label>
                <button type="button" onClick={() => { const v = randomViewCount(); const p = Math.floor(v * 0.3 * Math.random()); setForm({ ...form, views: v, purchased: p, downloads: Math.floor(Math.random() * (p + 1)) }); }}
                  className="text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2">Acak</button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1">Jumlah Dibaca</label>
                  <input type="number" min={0} value={form.views} onChange={(e) => setForm({ ...form, views: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-muted mb-1">Jumlah Dibeli</label>
                  <input type="number" min={0} value={form.purchased} onChange={(e) => setForm({ ...form, purchased: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0" />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-muted mb-1">Jumlah Download</label>
                <input type="number" min={0} value={form.downloads} onChange={(e) => setForm({ ...form, downloads: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-muted mb-1">Jumlah Halaman</label>
              <input type="number" min={0} value={form.page_count} onChange={(e) => setForm({ ...form, page_count: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="0" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-surface-dark text-foreground font-medium rounded-2xl hover:bg-border transition-colors">Batal</button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                {submitting ? "Menyimpan..." : editingBook ? "Simpan Perubahan" : "Tambah Buku"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

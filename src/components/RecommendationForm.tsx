"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Send,
  CheckCircle2,
  Loader2,
  Upload,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
} from "lucide-react";

export default function RecommendationForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    cover_url: "",
    file_url: "",
    name: "",
    email: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        const cats = [...new Set((data || []).map((b: { category: string }) => b.category).filter(Boolean))] as string[];
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setUseUrlInput(false);
  };

  const uploadCover = async (): Promise<string> => {
    if (!coverFile) return form.cover_url;
    setUploading(true);
    const body = new FormData();
    body.append("file", coverFile);
    const res = await fetch("/api/upload", { method: "POST", body });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Gagal upload cover");
    }
    const data = await res.json();
    setUploading(false);
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.file_url.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      let coverUrl = form.cover_url;
      if (coverFile) {
        coverUrl = await uploadCover();
      }

      const payload = {
        ...form,
        cover_url: coverUrl,
      };

      const res = await fetch("/api/book-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ title: "", author: "", description: "", category: "", cover_url: "", file_url: "", name: "", email: "" });
        setCoverFile(null);
        setCoverPreview("");
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengirim rekomendasi");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Rekomendasi Terkirim!</h2>
        <p className="text-muted max-w-md mx-auto mb-8">
          Terima kasih! Tim kami akan meninjau rekomendasi ebook Anda. Jika disetujui, ebook akan langsung tersedia di perpustakaan.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-2xl hover:bg-primary-dark transition-colors"
        >
          Kirim Rekomendasi Lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Judul Ebook <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
            placeholder="Judul ebook"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Link Google Drive <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            value={form.file_url}
            onChange={(e) => setForm({ ...form, file_url: e.target.value })}
            required
            className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
            placeholder="https://drive.google.com/..."
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Penulis</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
            placeholder="Nama penulis (pisahkan dengan koma)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Kategori</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all appearance-none"
          >
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Deskripsi</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all resize-none"
          placeholder="Deskripsi singkat ebook"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Cover Ebook (opsional)</label>
        <p className="text-xs text-muted mb-2">Kosongkan saja, nanti cover otomatis diambil dari Google Drive link.</p>
        <input
          type="url"
          value={form.cover_url}
          onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
          placeholder="https://drive.google.com/... (opsional)"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Nama Kamu</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
            placeholder="Nama (opsional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
            placeholder="email@contoh.com (opsional)"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-2xl border border-red-500/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !form.title.trim() || !form.file_url.trim() || uploading}
        className="w-full py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Upload cover...
          </>
        ) : submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Kirim Rekomendasi
          </>
        )}
      </button>
    </form>
  );
}

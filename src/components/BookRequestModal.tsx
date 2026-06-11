"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, CheckCircle2, Loader2 } from "lucide-react";

interface BookRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
}

export default function BookRequestModal({ isOpen, onClose, searchQuery }: BookRequestModalProps) {
  const [form, setForm] = useState({
    title: searchQuery || "",
    author: "",
    description: "",
    name: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/book-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ title: "", author: "", description: "", name: "", email: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Gagal mengirim usulan");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-lg glass rounded-3xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Usulan Terkirim!</h3>
                  <p className="text-sm text-muted mb-6">
                    Terima kasih! Tim kami akan meninjau usulan buku Anda.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Usulkan Buku</h2>
                      <p className="text-xs text-muted">Buku tidak tersedia? Usulkan di sini</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Judul Buku *
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="Masukkan judul buku"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Penulis
                      </label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="Nama penulis (pisahkan dengan koma)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Deskripsi
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                        placeholder="Deskripsi singkat (opsional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Nama
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="Nama kamu (opsional)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="email@contoh.com (opsional)"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !form.title.trim()}
                      className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Usulan"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

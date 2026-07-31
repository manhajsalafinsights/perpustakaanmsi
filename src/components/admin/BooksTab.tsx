"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Pencil, Trash2, BookOpen, Clock, Loader2, Star,
} from "lucide-react";
import { Book } from "@/lib/types";
import Pagination from "./Pagination";
import BookFormModal from "./BookFormModal";
import ConfirmModal from "./ConfirmModal";

export default function BooksTab() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookFilter, setBookFilter] = useState<"published" | "scheduled" | "berbayar">("published");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getHeaders = (h?: Record<string, string>) => {
    const token = sessionStorage.getItem("admin_token");
    const base: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (h) Object.assign(base, h);
    return base;
  };

  const fetchBooks = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ admin: "true", page: String(p), limit: "20" });
      if (searchQuery) params.set("search", searchQuery);
      if (bookFilter === "berbayar") {
        params.set("is_paid", "true");
      } else {
        params.set("status", bookFilter);
      }
      const res = await fetch(`/api/books?${params}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setBooks(json.data);
          setTotal(json.total || 0);
          setTotalPages(json.totalPages || 1);
        } else {
          setBooks(json);
          setTotal(json.length);
          setTotalPages(1);
        }
        const catsRes = await fetch("/api/books?admin=true");
        if (catsRes.ok) {
          const catsJson = await catsRes.json();
          const allBooks = catsJson.data || catsJson;
          setCategories([...new Set((Array.isArray(allBooks) ? allBooks : []).map((b: Book) => b.category).filter(Boolean) as string[])]);
        }
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [searchQuery, bookFilter]);

  useEffect(() => {
    fetchBooks(page);
  }, [page, fetchBooks]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/books?id=${confirmDelete.id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== confirmDelete.id));
        setTotal((prev) => prev - 1);
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Gagal menghapus: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Gagal menghapus: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleSaved = () => {
    fetchBooks(page);
  };

  const [featuredLoading, setFeaturedLoading] = useState<string | null>(null);

  const handleToggleFeatured = async (book: Book) => {
    if (featuredLoading) return;
    setFeaturedLoading(book.id);
    try {
      const res = await fetch("/api/books", {
        method: "PUT",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: book.id, is_featured: !book.is_featured }),
      });
      if (res.ok) {
        fetchBooks(page);
      } else if (res.status === 401) {
        alert("Sesi habis, silakan login ulang");
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Gagal mengunggulkan: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Gagal mengunggulkan: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setFeaturedLoading(null);
    }
  };

  return (
    <div className="glass rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-foreground">Koleksi Buku</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text" placeholder="Cari buku..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <button
            onClick={() => { setEditingBook(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Tambah Buku
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-4 sm:px-6 pb-4">
        {[
          { id: "published" as const, label: "Live" },
          { id: "scheduled" as const, label: "Scheduled" },
          { id: "berbayar" as const, label: "Berbayar" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setBookFilter(t.id); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              bookFilter === t.id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground hover:bg-surface-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-6 py-12 flex items-center justify-center text-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /><p className="text-sm">Memuat...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-dark border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Buku</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Kategori</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">Status</th>
                  <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">Jilid</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">Tanggal</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {books.map((book) => {
                  const volCount = book.volumes?.length || (book.file_url ? 1 : 0);
                  return (
                    <tr key={book.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-14 bg-surface-dark rounded-lg overflow-hidden flex-shrink-0">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px] flex items-center gap-1.5">
                              {book.title}
                              {book.is_featured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  <Star className="w-2.5 h-2.5" fill="currentColor" /> Unggulan
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted truncate max-w-[200px]">{book.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{book.category}</span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${book.is_paid ? "bg-accent/10 text-accent" : "bg-green-500/10 text-green-500"}`}>
                            {book.is_paid ? "Berbayar" : "Gratis"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {book.status === "scheduled" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> Scheduled
                          </span>
                        ) : book.status === "draft" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted bg-surface-dark px-2.5 py-1 rounded-full">Draft</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">Live</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-center">
                        {volCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            <BookOpen className="w-3 h-3" /> {volCount} Jilid
                          </span>
                        ) : (
                          <span className="text-xs text-muted">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted">
                          {new Date(
                            book.status === "published" && book.published_at ? book.published_at :
                            book.status === "scheduled" && book.scheduled_at ? book.scheduled_at :
                            book.created_at
                          ).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleFeatured(book)}
                            disabled={!!featuredLoading}
                            title={book.is_featured ? "Batalkan unggulan" : "Jadikan buku unggulan"}
                            className={`p-2 rounded-lg transition-all disabled:opacity-50 ${book.is_featured ? "text-amber-500 hover:bg-amber-500/10" : "text-muted hover:text-amber-500 hover:bg-amber-500/10"}`}
                          >
                            {featuredLoading === book.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Star className="w-4 h-4" fill={book.is_featured ? "currentColor" : "none"} />
                            )}
                          </button>
                          <button onClick={() => { setEditingBook(book); setShowModal(true); }}
                            className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(book)}
                            className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {books.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{searchQuery ? "Tidak ada buku yang cocok" : "Belum ada buku"}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}

      <BookFormModal
        open={showModal}
        editingBook={editingBook}
        categories={categories}
        onClose={() => { setShowModal(false); setEditingBook(null); }}
        onSaved={handleSaved}
      />

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Buku"
        message={`Yakin ingin menghapus buku "${confirmDelete?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
}

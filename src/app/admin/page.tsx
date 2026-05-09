"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Image,
  FileText,
  Tag,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Book } from "@/lib/types";
import { StatsSkeleton } from "@/components/Skeleton";

interface AdminStats {
  totalBooks: number;
  totalVisitors: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_super: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalBooks: 0, totalVisitors: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    cover_url: "",
    file_url: "",
    category: "",
    is_paid: false,
    views: 0,
    purchased: 0,
    downloads: 0,
    price: 25000,
    promo_price: 0,
    promo_text: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_is_super", String(data.admin.is_super));
        setIsLoggedIn(true);
        setIsSuper(data.admin.is_super);
      } else {
        const data = await res.json();
        setLoginError(data.error || "Login gagal");
      }
    } catch {
      setLoginError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      setIsLoggedIn(true);
      setIsSuper(sessionStorage.getItem("admin_is_super") === "true");
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      setStatsLoading(true);
      try {
        const [booksRes, visitorRes, adminsRes] = await Promise.all([
          fetch("/api/books"),
          fetch("/api/visitor"),
          fetch("/api/auth"),
        ]);
        if (booksRes.ok) {
          const booksData = await booksRes.json();
          setBooks(booksData);
          setStats((prev) => ({ ...prev, totalBooks: booksData.length }));
          const uniqueCategories = [...new Set(booksData.map((b: Book) => b.category).filter(Boolean) as string[])];
          setCategories(uniqueCategories);
        }
        if (visitorRes.ok) {
          const visitorData = await visitorRes.json();
          setStats((prev) => ({ ...prev, totalVisitors: 5000000 + (visitorData.count || 0) }));
        }
        if (adminsRes.ok) {
          const adminsData = await adminsRes.json();
          setAdmins(adminsData);
        }
      } catch {
        // ignore
      } finally {
        setStatsLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_is_super");
    setIsLoggedIn(false);
    setIsSuper(false);
  };

  const openAddModal = () => {
    setEditingBook(null);
    setForm({ title: "", description: "", cover_url: "", file_url: "", category: "", is_paid: false, views: 0, purchased: 0, downloads: 0, price: 25000, promo_price: 0, promo_text: "" });
    setCustomCategory("");
    setUseCustomCategory(false);
    setShowModal(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      description: book.description,
      cover_url: book.cover_url,
      file_url: book.file_url,
      category: book.category,
      is_paid: book.is_paid || false,
      views: book.views || 0,
      purchased: book.purchased || 0,
      downloads: book.downloads || 0,
      price: book.price || 25000,
      promo_price: book.promo_price || 0,
      promo_text: book.promo_text || "",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const url = editingBook ? "/api/books" : "/api/books";
      const method = editingBook ? "PUT" : "POST";
      const body = editingBook ? { ...form, id: editingBook.id } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        const booksRes = await fetch("/api/books");
        if (booksRes.ok) {
          const booksData = await booksRes.json();
          setBooks(booksData);
          setStats((prev) => ({ ...prev, totalBooks: booksData.length }));
        }
      }
    } catch {
      // ignore
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus buku ini?")) return;

    try {
      const res = await fetch(`/api/books?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== id));
        setStats((prev) => ({ ...prev, totalBooks: prev.totalBooks - 1 }));
      }
    } catch {
      // ignore
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password.trim()) return;
    setAdminSubmitting(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...adminForm, requester_is_super: isSuper }),
      });
      if (res.ok) {
        setShowAdminModal(false);
        setAdminForm({ name: "", email: "", password: "" });
        const adminsRes = await fetch("/api/auth");
        if (adminsRes.ok) setAdmins(await adminsRes.json());
      }
    } catch {
      // ignore
    } finally {
      setAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    if (admins.length <= 1) {
      alert("Tidak bisa menghapus admin terakhir.");
      return;
    }
    try {
      const res = await fetch(`/api/auth?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
              <p className="text-sm text-muted mt-1">
                Masuk untuk mengelola perpustakaan
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="admin@perpustakaan.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-muted hover:text-primary transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted mt-1">
            Kelola koleksi buku perpustakaan digital
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Buku</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalBooks}
                </p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted">Total Pengunjung</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalVisitors.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">Koleksi Buku</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tambah Buku
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-dark border-b border-border">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                  Buku
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                  Kategori
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                  Tanggal
                </th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredBooks.map((book) => (
                <tr
                  key={book.id}
                  className="hover:bg-surface/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 bg-surface-dark rounded-lg overflow-hidden flex-shrink-0">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {book.title}
                        </p>
                        <p className="text-xs text-muted truncate max-w-[200px]">
                          {book.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {book.category}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${book.is_paid ? "bg-accent/10 text-accent" : "bg-green-500/10 text-green-500"}`}>
                        {book.is_paid ? "Berbayar" : "Gratis"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-sm text-muted">
                      {new Date(book.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-2 text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery
                        ? "Tidak ada buku yang cocok"
                        : "Belum ada buku"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-lg glass rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingBook ? "Edit Buku" : "Tambah Buku Baru"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 bg-surface-dark rounded-full flex items-center justify-center hover:bg-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Judul Buku *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Masukkan judul buku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    placeholder="Deskripsi singkat tentang buku"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Image className="w-4 h-4" />
                      Link Cover (Google Drive)
                    </div>
                  </label>
                  <input
                    type="url"
                    value={form.cover_url}
                    onChange={(e) =>
                      setForm({ ...form, cover_url: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Link PDF (Google Drive)
                    </div>
                  </label>
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={(e) =>
                      setForm({ ...form, file_url: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      Kategori
                    </div>
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomCategory(false);
                          setForm({ ...form, category: "" });
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                          !useCustomCategory
                            ? "bg-primary text-white"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        Pilih Kategori
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomCategory(true);
                          setForm({ ...form, category: customCategory });
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                          useCustomCategory
                            ? "bg-primary text-white"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        + Buat Baru
                      </button>
                    </div>
                    {!useCustomCategory ? (
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih kategori --</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setForm({ ...form, category: e.target.value });
                        }}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        placeholder="Ketik kategori baru..."
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Status Buku
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_paid: false })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                        !form.is_paid
                          ? "bg-green-600 text-white"
                          : "bg-surface text-muted border border-border"
                      }`}
                    >
                      Gratis
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_paid: true })}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                        form.is_paid
                          ? "bg-accent text-white"
                          : "bg-surface text-muted border border-border"
                      }`}
                    >
                      Berbayar
                    </button>
                  </div>

                  {form.is_paid && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <label className="block text-xs text-muted mb-1">Harga (Rp)</label>
                        <input
                          type="number"
                          min={0}
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          placeholder="25000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Harga Promo (Rp) — kosongkan jika tidak ada promo</label>
                        <input
                          type="number"
                          min={0}
                          value={form.promo_price || ""}
                          onChange={(e) =>
                            setForm({ ...form, promo_price: parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">Tulisan Promo (misal: "Diskon 50%")</label>
                        <input
                          type="text"
                          value={form.promo_text}
                          onChange={(e) =>
                            setForm({ ...form, promo_text: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          placeholder="Diskon 50%, Ramadhan Sale, dll"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Statistik Buku
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-muted mb-1">Jumlah Dibaca</label>
                      <input
                        type="number"
                        min={0}
                        value={form.views}
                        onChange={(e) =>
                          setForm({ ...form, views: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-muted mb-1">Jumlah Dibeli</label>
                      <input
                        type="number"
                        min={0}
                        value={form.purchased}
                        onChange={(e) =>
                          setForm({ ...form, purchased: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-muted mb-1">Jumlah Download</label>
                    <input
                      type="number"
                      min={0}
                      value={form.downloads}
                      onChange={(e) =>
                        setForm({ ...form, downloads: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-surface-dark text-foreground font-medium rounded-2xl hover:bg-border transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {formSubmitting
                      ? "Menyimpan..."
                      : editingBook
                      ? "Simpan Perubahan"
                      : "Tambah Buku"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}

      {isSuper && (
      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Kelola Admin</h2>
              <p className="text-xs text-muted">{admins.length} admin terdaftar</p>
            </div>
          </div>
          <button
            onClick={() => {
              setAdminForm({ name: "", email: "", password: "" });
              setShowAdminModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Admin
          </button>
        </div>

        <div className="divide-y divide-border/50">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${admin.is_super ? "bg-accent/10" : "bg-primary/10"}`}>
                  <Users className={`w-5 h-5 ${admin.is_super ? "text-accent" : "text-primary"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{admin.name}</p>
                    {admin.is_super && (
                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        SUPER ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">{admin.email}</p>
                </div>
              </div>
              {!admin.is_super && (
                <button
                  onClick={() => handleDeleteAdmin(admin.id)}
                  className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      {showAdminModal && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAdminModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[60] sm:w-full sm:max-w-md glass rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Tambah Admin Baru</h2>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="w-10 h-10 bg-surface-dark rounded-full flex items-center justify-center hover:bg-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nama Admin *
                  </label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Masukkan nama"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="admin@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Password *
                  </label>
                  <input
                    type="text"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="flex-1 py-3 bg-surface-dark text-foreground font-medium rounded-2xl hover:bg-border transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={adminSubmitting}
                    className="flex-1 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {adminSubmitting ? "Menyimpan..." : "Tambah Admin"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

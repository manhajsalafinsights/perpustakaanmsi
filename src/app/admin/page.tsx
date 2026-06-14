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
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MailQuestion,
} from "lucide-react";
import Link from "next/link";
import { Book, BookVolume } from "@/lib/types";
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

interface Comment {
  id: string;
  book_id: string;
  name: string;
  message: string;
  created_at: string;
  books?: { title: string };
}

interface BookRequest {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  name: string | null;
  email: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface BookRecommendation {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  category: string | null;
  cover_url: string | null;
  file_url: string;
  name: string | null;
  email: string | null;
  status: "pending" | "approved" | "rejected";
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
    category: "",
    author: "",
    translator: "",
    is_paid: false,
    status: "published",
    scheduled_at: "",
    views: 0,
    purchased: 0,
    downloads: 0,
    price: 25000,
    promo_price: 0,
    promo_text: "",
  });
  const [volumes, setVolumes] = useState<{ title: string; file_url: string }[]>([
    { title: "Jilid 1", file_url: "" },
  ]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const [bookRequestLoading, setBookRequestLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

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
        const [booksRes, visitorRes, adminsRes, commentsRes] = await Promise.all([
          fetch("/api/books?admin=true"),
          fetch("/api/visitor"),
          fetch("/api/auth"),
          fetch("/api/comments?book_id=all"),
        ]);
        const token = sessionStorage.getItem("admin_token");
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
        if (commentsRes.ok) {
          setComments(await commentsRes.json());
        }
      } catch {
        // ignore
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchBookRequests = async () => {
      setBookRequestLoading(true);
      try {
        const token = sessionStorage.getItem("admin_token");
        const res = await fetch("/api/book-requests", {
          headers: { authorization: token || "" },
        });
        if (res.ok) {
          setBookRequests(await res.json());
        }
      } catch {
        // ignore
      } finally {
        setBookRequestLoading(false);
      }
    };
    fetchData();
    fetchBookRequests();
    fetchBookRecommendations();
  }, [isLoggedIn]);

  const fetchBookRecommendations = async () => {
    setRecommendationLoading(true);
    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch("/api/book-recommendations", {
        headers: { authorization: token || "" },
      });
      if (res.ok) {
        setRecommendations(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_is_super");
    setIsLoggedIn(false);
    setIsSuper(false);
  };

  const normalizeTitle = (s: string) =>
    s.replace(/\b\w/g, (c) => c.toUpperCase());

  const extractClientSide = async (url: string) => {
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
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

          interface ItemEx { x: number; w: number; text: string }
          const pageItems: { y: number; items: ItemEx[] }[] = [];

          for (const item of content.items) {
            const it = item as { str?: string; transform?: number[]; width?: number };
            if (!it.str || !it.str.trim() || !it.transform || it.width === undefined) continue;
            const x = Math.round(it.transform[4]);
            const y = Math.round(it.transform[5]);
            let row = pageItems.find((r) => Math.abs(r.y - y) < 3);
            if (!row) { row = { y, items: [] }; pageItems.push(row); }
            row.items.push({ x, w: Math.round(it.width), text: it.str });
          }

          pageItems.sort((a, b) => b.y - a.y);
          const pageText = pageItems.map((row) => {
            const arr = row.items.sort((a, b) => a.x - b.x);
            let line = arr[0].text;
            for (let j = 1; j < arr.length; j++) {
              const gap = arr[j].x - (arr[j - 1].x + arr[j - 1].w);
              line += gap > 8 ? " " + arr[j].text : arr[j].text;
            }
            return line;
          }).join("\n");
          if (pageText.trim() && !/daftar\s*isi/i.test(pageText)) pageTexts.push(pageText);
        }

        const allText = pageTexts.join("\n\n");
        console.log("[extractClientSide] allText:", allText);

        const lines = allText.split("\n").map((l) => l.trim()).filter(Boolean);
        const knownLabels = new Set([
          "judul", "judul buku", "judul asli", "judul kitab",
          "penulis", "pengarang", "penyusun",
          "penerjemah", "deskripsi", "tata letak", "tata letak & layout",
          "ukuran buku", "edisi", "diterbitkan oleh", "desain & layout",
          "materi", "editor", "cover", "halaman",
        ]);

        const findValue = (labelVariants: string[], textLines: string[]) => {
          for (let i = 0; i < textLines.length - 1; i++) {
            const line = textLines[i].toLowerCase().replace(/[:.]+$/, "").trim();
            if (labelVariants.some((v) => line === v)) {
              const val = textLines[i + 1];
              if (val && !knownLabels.has(val.toLowerCase().replace(/[:.]+$/, "").trim())) {
                return val;
              }
            }
          }
          return "";
        };

        if (lines.length > 0) {
          const rawTitle = findValue(["judul", "judul buku", "judul asli", "judul kitab"], lines);
          if (rawTitle) {
            title = normalizeTitle(rawTitle.toLowerCase())
              .replace(/\[[^\]]*\]/g, "")
              .trim();
            if (title.length > 3 && title.length < 150) titleFound = true;
            else title = "";
          }

          const rawAuthor = findValue(["penulis", "pengarang", "penyusun"], lines);
          if (rawAuthor) {
            author = rawAuthor.replace(/\[[^\]]*\]/g, "").trim();
            if (author.length > 0) authorFound = true;
          }

          const rawTranslator = findValue(["penerjemah"], lines);
          if (rawTranslator) {
            translator = rawTranslator.replace(/\[[^\]]*\]/g, "").trim();
            if (translator.length > 0) translatorFound = true;
          }

          const rawDesc = findValue(["deskripsi"], lines);
          if (rawDesc && rawDesc.replace(/[^a-zA-Z0-9\s]/g, "").length > rawDesc.length * 0.5) {
            const ds = rawDesc.match(/^.*?[.!?]/);
            description = ds
              ? ds[0] + " Baca selanjutnya..."
              : rawDesc.slice(0, 200) + (rawDesc.length > 200 ? " Baca selanjutnya..." : "");
            if (description.length > 0) descFound = true;
          }
        }
      } catch (e) { console.error("text extract error:", e); }

      await pdfDoc.destroy();
      return { title, author, translator, description, titleFound, authorFound, translatorFound, descFound };
    } catch (e) {
      console.error("extractClientSide error:", e);
      return { title: "", author: "", translator: "", description: "", titleFound: false, authorFound: false, translatorFound: false, descFound: false };
    }
  };

  const autoExtractMetadata = async (url: string) => {
    if (!url.match(/drive\.google\.com/) || extracting) return;
    setExtracting(true);
    setExtractMsg(null);

    const client = await extractClientSide(url);
    const filledFields: string[] = [];

    if (client.titleFound) {
      filledFields.push("judul");
      setForm((prev) => ({ ...prev, title: client.title }));
    }
    if (client.authorFound) {
      filledFields.push("penulis");
      setForm((prev) => ({ ...prev, author: client.author }));
    }
    if (client.translatorFound) {
      filledFields.push("penerjemah");
      setForm((prev) => ({ ...prev, translator: client.translator }));
    }
    if (client.descFound) {
      filledFields.push("deskripsi");
      setForm((prev) => ({ ...prev, description: client.description }));
    }

    setExtracting(false);
    if (filledFields.length > 0) {
      setExtractMsg({ type: "success", text: filledFields.join(", ") });
    } else {
      setExtractMsg({ type: "error", text: "Gagal mengekstrak data dari PDF" });
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setExtractMsg(null);
    setForm({ title: "", description: "", cover_url: "", category: "", author: "", translator: "", is_paid: false, status: "published", scheduled_at: "", views: 0, purchased: 0, downloads: 0, price: 25000, promo_price: 0, promo_text: "" });
    setVolumes([{ title: "Jilid 1", file_url: "" }]);
    setCustomCategory("");
    setUseCustomCategory(false);
    setShowModal(true);
  };

  const openEditModal = async (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      description: book.description,
      cover_url: book.cover_url,
      category: book.category,
      author: book.author || "",
      translator: book.translator || "",
      is_paid: book.is_paid || false,
      status: book.status || "published",
      scheduled_at: book.scheduled_at ? book.scheduled_at.slice(0, 10) : "",
      views: book.views || 0,
      purchased: book.purchased || 0,
      downloads: book.downloads || 0,
      price: book.price || 25000,
      promo_price: book.promo_price || 0,
      promo_text: book.promo_text || "",
    });

    try {
      const res = await fetch(`/api/books?id=${book.id}&include_volumes=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.volumes && data.volumes.length > 0) {
          setVolumes(data.volumes.map((v: BookVolume) => ({ title: v.title, file_url: v.file_url })));
        } else if (book.file_url) {
          setVolumes([{ title: "Jilid 1", file_url: book.file_url }]);
        } else {
          setVolumes([{ title: "Jilid 1", file_url: "" }]);
        }
      } else {
        setVolumes(book.file_url ? [{ title: "Jilid 1", file_url: book.file_url }] : [{ title: "Jilid 1", file_url: "" }]);
      }
    } catch {
      setVolumes(book.file_url ? [{ title: "Jilid 1", file_url: book.file_url }] : [{ title: "Jilid 1", file_url: "" }]);
    }

    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    const validVolumes = volumes.filter((v) => v.file_url.trim());
    if (validVolumes.length === 0) {
      alert("Minimal satu jilid harus memiliki link download!");
      setFormSubmitting(false);
      return;
    }

    let cover = form.cover_url;
    if (!cover && validVolumes[0]?.file_url) {
      const m = validVolumes[0].file_url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
        || validVolumes[0].file_url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
      if (m) cover = `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
    }

    try {
      const url = "/api/books";
      const method = editingBook ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        ...form,
        cover_url: cover,
        volumes: validVolumes,
      };
      if (editingBook) body.id = editingBook.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        const booksRes = await fetch("/api/books?admin=true");
        if (booksRes.ok) {
          const booksData = await booksRes.json();
          setBooks(booksData);
          setStats((prev) => ({ ...prev, totalBooks: booksData.length }));
          const uniqueCategories = [...new Set(booksData.map((b: Book) => b.category).filter(Boolean) as string[])];
          setCategories(uniqueCategories);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Gagal menyimpan: " + (err.error || "Unknown error"));
      }
    } catch (e) {
      alert("Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)));
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

  const toggleComment = (id: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Yakin ingin menghapus komentar ini?")) return;
    try {
      const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch("/api/book-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: token || "" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Yakin ingin menghapus usulan ini?")) return;
    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch(`/api/book-requests?id=${id}`, {
        method: "DELETE",
        headers: { authorization: token || "" },
      });
      if (res.ok) {
        setBookRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateRecommendation = async (id: string, status: string) => {
    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch("/api/book-recommendations", {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: token || "" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecommendations((prev) => prev.map((r) => (r.id === id ? updated : r)));
        if (status === "approved") {
          fetchBookRecommendations();
        }
      } else {
        const data = await res.json();
        alert(data.error || "Gagal memproses rekomendasi");
      }
    } catch {
      alert("Terjadi kesalahan");
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    if (!confirm("Yakin ingin menghapus rekomendasi ini?")) return;
    try {
      const token = sessionStorage.getItem("admin_token");
      const res = await fetch(`/api/book-recommendations?id=${id}`, {
        method: "DELETE",
        headers: { authorization: token || "" },
      });
      if (res.ok) {
        setRecommendations((prev) => prev.filter((r) => r.id !== id));
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
                <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20">
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
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
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
                  Status
                </th>
                <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                  Jilid
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
              {filteredBooks.map((book) => {
                const volCount = book.volumes?.length || (book.file_url ? 1 : 0);
                return (
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
                    {book.status === "scheduled" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        Scheduled
                      </span>
                    ) : book.status === "draft" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted bg-surface-dark px-2.5 py-1 rounded-full">
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                        Live
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-center">
                    {volCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        <BookOpen className="w-3 h-3" />
                        {volCount} Jilid
                      </span>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
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
                        className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Penulis
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) =>
                        setForm({ ...form, author: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Nama penulis (pisahkan dengan koma)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Penerjemah
                    </label>
                    <input
                      type="text"
                      value={form.translator}
                      onChange={(e) =>
                        setForm({ ...form, translator: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Nama penerjemah"
                    />
                  </div>
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-foreground">
                      Daftar Jilid *
                    </label>
                    <button
                      type="button"
                      onClick={() => setVolumes([...volumes, { title: `Jilid ${volumes.length + 1}`, file_url: "" }])}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Jilid
                    </button>
                  </div>
                  <div className="space-y-3">
                    {volumes.map((vol, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass rounded-xl p-3 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-foreground">Jilid {idx + 1}</span>
                          {volumes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setVolumes(volumes.filter((_, i) => i !== idx))}
                              className="p-1 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={vol.title}
                            onChange={(e) => {
                              const next = [...volumes];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setVolumes(next);
                            }}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            placeholder="Nama jilid (mis: Jilid 1)"
                          />
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                              <input
                                type="url"
                                value={vol.file_url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const next = [...volumes];
                                  next[idx] = { ...next[idx], file_url: val };
                                  setVolumes(next);
                                }}
                                onPaste={(e) => {
                                  const pasted = e.clipboardData.getData("text");
                                  if (idx === 0 && pasted.match(/drive\.google\.com/)) {
                                    setTimeout(() => autoExtractMetadata(pasted), 100);
                                  }
                                }}
                                onBlur={(e) => {
                                  if (idx === 0) autoExtractMetadata(e.target.value);
                                }}
                                required
                                className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                placeholder="Link PDF (Google Drive)..."
                              />
                              {idx === 0 && (
                                <button
                                  type="button"
                                  onClick={() => autoExtractMetadata(vol.file_url)}
                                  disabled={extracting || !vol.file_url}
                                  className="px-2.5 py-2 text-xs font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                                >
                                  {extracting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    "Extract"
                                  )}
                                </button>
                              )}
                            </div>
                            {idx === 0 && extractMsg && (
                              <p
                                className={`text-[11px] ${
                                  extractMsg.type === "success"
                                    ? "text-green-500"
                                    : "text-red-400"
                                }`}
                              >
                                {extractMsg.type === "success"
                                  ? `✓ ${extractMsg.text}`
                                  : `✗ ${extractMsg.text}`}
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
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Status Publikasi
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(["published", "draft", "scheduled"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                          form.status === s
                            ? s === "published"
                              ? "bg-green-600 text-white"
                              : s === "draft"
                              ? "bg-surface-dark text-foreground border border-border"
                              : "bg-amber-600 text-white"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        {s === "published" ? "Published" : s === "draft" ? "Draft" : "Scheduled"}
                      </button>
                    ))}
                  </div>
                  {form.status === "scheduled" && (
                    <div>
                      <label className="block text-xs text-muted mb-1">Tanggal Launching</label>
                      <input
                        type="date"
                        value={form.scheduled_at}
                        onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  )}
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
                    className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
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

      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Kelola Komentar</h2>
              <p className="text-xs text-muted">{comments.length} komentar terbaru</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {comments.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada komentar</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isExpanded = expandedComments.has(comment.id);
              const preview = comment.message.length > 80 ? comment.message.slice(0, 80) + "..." : comment.message;
              return (
                <div key={comment.id} className="px-6 py-3 flex items-start justify-between hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => toggleComment(comment.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{comment.name}</span>
                      <span className="text-xs text-muted">
                        {new Date(comment.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className={`text-sm text-muted ${isExpanded ? "" : "line-clamp-1"}`}>
                      {isExpanded ? comment.message : preview}
                    </p>
                    {comment.books && (
                      <p className="text-xs text-primary/70 mt-0.5">pada: {comment.books.title}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id); }}
                    className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 ml-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Usulan Buku ── */}
      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <MailQuestion className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Usulan Buku</h2>
              <p className="text-xs text-muted">{bookRequests.length} usulan</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {bookRequestLoading ? (
            <div className="px-6 py-12 flex items-center justify-center text-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <p className="text-sm">Memuat usulan...</p>
            </div>
          ) : bookRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted">
              <MailQuestion className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada usulan buku</p>
            </div>
          ) : (
            bookRequests.map((req) => (
              <div key={req.id} className="px-6 py-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{req.title}</span>
                      {req.author && (
                        <span className="text-xs text-muted">— {req.author}</span>
                      )}
                    </div>
                    {req.description && (
                      <p className="text-xs text-muted mb-1.5 line-clamp-2">{req.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {req.name && <span>{req.name}</span>}
                      {req.email && <span>{req.email}</span>}
                      <span>•</span>
                      <span>
                        {new Date(req.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "approved")}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Setujui"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, "rejected")}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Tolak"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {req.status === "approved" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Disetujui
                      </span>
                    )}
                    {req.status === "rejected" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Ditolak
                      </span>
                    )}
                    {isSuper && (
                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Rekomendasi Ebook ── */}
      <div className="glass rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Rekomendasi Ebook</h2>
              <p className="text-xs text-muted">{recommendations.length} rekomendasi</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          {recommendationLoading ? (
            <div className="px-6 py-12 flex items-center justify-center text-muted">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <p className="text-sm">Memuat rekomendasi...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada rekomendasi ebook</p>
            </div>
          ) : (
            recommendations.map((rec) => (
              <div key={rec.id} className="px-6 py-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{rec.title}</span>
                      {rec.author && (
                        <span className="text-xs text-muted">— {rec.author}</span>
                      )}
                    </div>
                    {rec.description && (
                      <p className="text-xs text-muted mb-1.5 line-clamp-2">{rec.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {rec.category && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          {rec.category}
                        </span>
                      )}
                      {rec.name && <span>{rec.name}</span>}
                      <span>•</span>
                      <span>
                        {new Date(rec.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rec.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateRecommendation(rec.id, "approved")}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Setujui & Publikasikan"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateRecommendation(rec.id, "rejected")}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Tolak"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {rec.status === "approved" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Disetujui
                      </span>
                    )}
                    {rec.status === "rejected" && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3 h-3" />
                        Ditolak
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteRecommendation(rec.id)}
                      className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

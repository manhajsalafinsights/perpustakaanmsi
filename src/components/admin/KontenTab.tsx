"use client";
import { useState, useEffect } from "react";
import {
  MessageCircle, MailQuestion, BookOpen, CheckCircle2, XCircle,
  Trash2, Loader2,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface Comment {
  id: string; book_id: string; name: string; message: string; created_at: string;
  books?: { title: string };
}

interface BookRequest {
  id: string; title: string; author: string | null; description: string | null;
  name: string | null; email: string | null; status: "pending" | "approved" | "rejected"; created_at: string;
}

interface BookRecommendation {
  id: string; title: string; author: string | null; description: string | null;
  category: string | null; cover_url: string | null; file_url: string;
  name: string | null; email: string | null; status: "pending" | "approved" | "rejected"; created_at: string;
}

type SubTab = "comments" | "requests" | "recommendations";

export default function KontenTab({ isSuper }: { isSuper: boolean }) {
  const [subTab, setSubTab] = useState<SubTab>("comments");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-surface-dark/50 rounded-xl p-1 w-fit">
        {[
          { id: "comments" as SubTab, label: "Komentar" },
          { id: "requests" as SubTab, label: "Usulan Buku" },
          { id: "recommendations" as SubTab, label: "Rekomendasi" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              subTab === t.id ? "bg-white dark:bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "comments" && <CommentsSection />}
      {subTab === "requests" && <RequestsSection isSuper={isSuper} />}
      {subTab === "recommendations" && <RecommendationsSection />}
    </div>
  );
}

function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<Comment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getHeaders = () => {
    const token = sessionStorage.getItem("admin_token");
    return { Authorization: `Bearer ${token}` } as Record<string, string>;
  };

  useEffect(() => {
    fetch("/api/comments?book_id=all").then((r) => { if (r.ok) r.json().then(setComments); });
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/comments?id=${confirmDelete.id}`, { method: "DELETE", headers: getHeaders() });
      if (res.ok) setComments((prev) => prev.filter((c) => c.id !== confirmDelete.id));
    } catch { /* ignore */ } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="glass rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Kelola Komentar</h2>
            <p className="text-xs text-muted">{comments.length} komentar</p>
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
            const isExpanded = expanded.has(comment.id);
            const preview = comment.message.length > 80 ? comment.message.slice(0, 80) + "..." : comment.message;
            return (
              <div key={comment.id} className="px-6 py-3 flex items-start justify-between hover:bg-surface/50 transition-colors cursor-pointer"
                onClick={() => setExpanded((prev) => { const next = new Set(prev); if (next.has(comment.id)) next.delete(comment.id); else next.add(comment.id); return next; })}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground">{comment.name}</span>
                    <span className="text-xs text-muted">{new Date(comment.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className={`text-sm text-muted ${isExpanded ? "" : "line-clamp-1"}`}>{isExpanded ? comment.message : preview}</p>
                  {comment.books && <p className="text-xs text-primary/70 mt-0.5">pada: {comment.books.title}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(comment); }}
                  className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 ml-3">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Hapus Komentar" message="Yakin ingin menghapus komentar ini?" loading={deleteLoading} />
    </div>
  );
}

function RequestsSection({ isSuper }: { isSuper: boolean }) {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<BookRequest | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getHeaders = (h?: Record<string, string>) => {
    const token = sessionStorage.getItem("admin_token");
    const base: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (h) Object.assign(base, h);
    return base;
  };

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/book-requests", { headers: getHeaders() });
    if (res.ok) setRequests(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch("/api/book-requests", {
      method: "PUT", headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/book-requests?id=${confirmDelete.id}`, { method: "DELETE", headers: getHeaders() });
    if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== confirmDelete.id));
    setDeleteLoading(false);
    setConfirmDelete(null);
  };

  return (
    <div className="glass rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <MailQuestion className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Usulan Buku</h2>
            <p className="text-xs text-muted">{requests.length} usulan</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {loading ? (
          <div className="px-6 py-12 flex items-center justify-center text-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /><p className="text-sm">Memuat...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted">
            <MailQuestion className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Belum ada usulan buku</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="px-6 py-4 hover:bg-surface/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{req.title}</span>
                    {req.author && <span className="text-xs text-muted">— {req.author}</span>}
                  </div>
                  {req.description && <p className="text-xs text-muted mb-1.5 line-clamp-2">{req.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {req.name && <span>{req.name}</span>}
                    {req.email && <span>{req.email}</span>}
                    <span>•</span>
                    <span>{new Date(req.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {req.status === "pending" && (
                    <>
                      <button onClick={() => handleStatus(req.id, "approved")} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Setujui"><CheckCircle2 className="w-4 h-4" /></button>
                      <button onClick={() => handleStatus(req.id, "rejected")} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Tolak"><XCircle className="w-4 h-4" /></button>
                    </>
                  )}
                  {req.status === "approved" && <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Disetujui</span>}
                  {req.status === "rejected" && <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" /> Ditolak</span>}
                  {isSuper && (
                    <button onClick={() => setConfirmDelete(req)} className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Hapus Usulan" message="Yakin ingin menghapus usulan buku ini?" loading={deleteLoading} />
    </div>
  );
}

function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<BookRecommendation | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getHeaders = (h?: Record<string, string>) => {
    const token = sessionStorage.getItem("admin_token");
    const base: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (h) Object.assign(base, h);
    return base;
  };

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/book-recommendations", { headers: getHeaders() });
    if (res.ok) setRecommendations(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch("/api/book-recommendations", {
      method: "PUT", headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecommendations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (status === "approved") fetchData();
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/book-recommendations?id=${confirmDelete.id}`, { method: "DELETE", headers: getHeaders() });
    if (res.ok) setRecommendations((prev) => prev.filter((r) => r.id !== confirmDelete.id));
    setDeleteLoading(false);
    setConfirmDelete(null);
  };

  return (
    <div className="glass rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
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
        {loading ? (
          <div className="px-6 py-12 flex items-center justify-center text-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /><p className="text-sm">Memuat...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Belum ada rekomendasi ebook</p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="px-6 py-4 hover:bg-surface/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{rec.title}</span>
                    {rec.author && <span className="text-xs text-muted">— {rec.author}</span>}
                  </div>
                  {rec.description && <p className="text-xs text-muted mb-1.5 line-clamp-2">{rec.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {rec.category && <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{rec.category}</span>}
                    {rec.name && <span>{rec.name}</span>}
                    <span>•</span>
                    <span>{new Date(rec.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {rec.status === "pending" && (
                    <>
                      <button onClick={() => handleStatus(rec.id, "approved")} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Setujui & Publikasikan"><CheckCircle2 className="w-4 h-4" /></button>
                      <button onClick={() => handleStatus(rec.id, "rejected")} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Tolak"><XCircle className="w-4 h-4" /></button>
                    </>
                  )}
                  {rec.status === "approved" && <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3 h-3" /> Disetujui</span>}
                  {rec.status === "rejected" && <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full"><XCircle className="w-3 h-3" /> Ditolak</span>}
                  <button onClick={() => setConfirmDelete(rec)} className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={handleDelete}
        title="Hapus Rekomendasi" message="Yakin ingin menghapus rekomendasi ini?" loading={deleteLoading} />
    </div>
  );
}

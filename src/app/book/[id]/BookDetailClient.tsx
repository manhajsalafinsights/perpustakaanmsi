"use client";

import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { Book, BookVolume } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

let activeUtterance: SpeechSynthesisUtterance | null = null;

import {
  BookOpen,
  Download,
  MessageCircle,
  Send,
  User,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  ArrowLeft,
  Lock,
  ShoppingCart,
  X,
  FileText,
  Loader2,
  BookmarkCheck,
  Clock,
  Volume2,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  AlertCircle,
} from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
  return String(n);
}

const WA_NUMBER = "62895393039750";
const MAX_FREE_PAGES = 10;

function getEmbedUrl(url: string): string {
  if (!url) return "";
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  const exportMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (exportMatch) {
    return `https://drive.google.com/file/d/${exportMatch[1]}/preview`;
  }
  return url;
}

interface Comment {
  id: string;
  book_id: string;
  name: string;
  message: string;
  created_at: string;
}

export default function BookDetailClient({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [volumes, setVolumes] = useState<BookVolume[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<BookVolume | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const numPagesRef = useRef(0);
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [savedPage, setSavedPage] = useState(0);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [ttsKey, setTtsKey] = useState(0);
  const showTTS = ttsKey > 0;
  const [flipDir, setFlipDir] = useState(0);
  const [flipAngle, setFlipAngle] = useState(0);
  const flipRef = useRef(false);

  const goPage = (dir: number) => {
    if (flipRef.current) return;
    flipRef.current = true;
    setFlipDir(dir);
    setFlipAngle(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipAngle(dir > 0 ? -180 : 180));
    });
    setTimeout(() => {
      setCurrentPage(p => Math.max(1, Math.min(numPagesRef.current, p + dir)));
      flipRef.current = false;
      setFlipAngle(0);
    }, 400);
  };

  // TTS inline
  const [ttsStatus, setTtsStatus] = useState("idle");
  const [ttsChunks, setTtsChunks] = useState<{ index: number; text: string }[]>([]);
  const [ttsIdx, setTtsIdx] = useState(0);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [ttsMsg, setTtsMsg] = useState("");
  const ttsIdxRef = useRef(0);
  const ttsChRef = useRef(ttsChunks);
  const ttsSpRef = useRef(ttsSpeed);
  const swipeRef = useRef({ x: 0, y: 0 });
  ttsIdxRef.current = ttsIdx;
  ttsChRef.current = ttsChunks;
  ttsSpRef.current = ttsSpeed;
  numPagesRef.current = numPages;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - worker entry has no type declarations
  useEffect(() => { import("react-pdf/dist/pdf.worker.entry"); }, []);
  useEffect(() => { window.speechSynthesis?.getVoices(); }, []);

  useEffect(() => {
    if (ttsKey === 0) return;
    const url = selectedVolume?.file_url || book?.file_url || "";
    if (!url) { setTtsMsg("Tidak ada file PDF"); setTtsStatus("error"); return; }
    let dead = false;
    (async () => {
      try {
        setTtsStatus("extracting");
        setTtsMsg(`Mengekstrak halaman ${currentPage}...`);
        const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
        const doc = await pdfjs.getDocument(proxyUrl).promise;
        if (dead) return;
        const pg = await doc.getPage(currentPage);
        const ct = await pg.getTextContent();
        const rows: { y: number; items: { x: number; text: string }[] }[] = [];
        for (const item of ct.items) {
          const it = item as { str?: string; transform?: number[] };
          if (!it.str?.trim() || !it.transform) continue;
          const x = Math.round(it.transform[4]), y = Math.round(it.transform[5]);
          let r = rows.find((rr) => Math.abs(rr.y - y) < 3);
          if (!r) { r = { y, items: [] }; rows.push(r); }
          r.items.push({ x, text: it.str });
        }
        rows.sort((a, b) => b.y - a.y);
        const lines = rows.map((r) => r.items.sort((a, b) => a.x - b.x).map((it) => it.text).join(" ")).filter(Boolean);
        const t = lines.join("\n").trim();
        await doc.destroy();
        if (dead) return;
        if (!t || /daftar\s*isi/i.test(t)) { setTtsMsg("Tidak ada teks di halaman ini"); setTtsStatus("error"); return; }
        const raw = t.replace(/\s+/g, " ").trim();
        const chunks: { index: number; text: string }[] = [];
        const sents = raw.match(/[^.!?]+[.!?]+/g) || [raw];
        for (const s of sents) {
          const tr = s.trim();
          if (tr.length > 10) chunks.push({ index: chunks.length, text: tr });
        }
        if (dead) return;
        if (chunks.length === 0) { setTtsMsg("Teks terlalu pendek"); setTtsStatus("error"); return; }
        setTtsChunks(chunks);
        setTtsStatus("ready");
      } catch (e: any) {
        if (!dead) { setTtsMsg("Gagal: " + (e?.message || "unknown")); setTtsStatus("error"); }
      }
    })();
    return () => { dead = true; if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel(); };
  }, [ttsKey]);

  const ttsSpeak = (idx: number) => {
    const c = ttsChRef.current;
    if (idx >= c.length) { setTtsStatus("done"); return; }
    setTtsIdx(idx);
    setTtsStatus("playing");
    const ss = window.speechSynthesis;
    if (!ss) { setTtsStatus("done"); return; }
    const clean = c[idx].text.replace(/[^\w\s.,!?;:'"()\-]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean || clean.length < 2) { ttsSpeak(idx + 1); return; }
    ss.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "id-ID";
    u.rate = ttsSpRef.current;
    u.volume = 1;
    activeUtterance = u;
    let done = false;
    const finish = () => { if (done) return; done = true; setTtsStatus("done"); };
    u.onend = () => { finish(); const n = ttsIdxRef.current + 1; if (n < ttsChRef.current.length) ttsSpeak(n); };
    u.onerror = () => finish();
    const fb = setTimeout(() => finish(), 8000);
    u.onstart = () => clearTimeout(fb);
    try { ss.speak(u); } catch { finish(); }
  };

  const ttsPlay = () => {
    if (ttsStatus === "ready" || ttsStatus === "done") ttsSpeak(ttsStatus === "done" ? 0 : ttsIdxRef.current);
    else if (ttsStatus === "paused") { setTtsStatus("playing"); window.speechSynthesis?.resume(); }
  };
  const ttsPause = () => { setTtsStatus("paused"); window.speechSynthesis?.pause(); };
  const ttsStop = () => { window.speechSynthesis?.cancel(); setTtsStatus("ready"); setTtsIdx(0); };
  const ttsPrev = () => { window.speechSynthesis?.cancel(); const i = Math.max(0, ttsIdxRef.current - 1); if (ttsStatus === "playing" || ttsStatus === "paused") ttsSpeak(i); else setTtsIdx(i); };
  const ttsNext = () => { window.speechSynthesis?.cancel(); const i = Math.min(ttsChRef.current.length - 1, ttsIdxRef.current + 1); if (ttsStatus === "playing" || ttsStatus === "paused") ttsSpeak(i); else setTtsIdx(i); };

  const PROGRESS_KEY = `book_progress_${id}`;

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch { return 0; }
  };

  const persistPage = (page: number) => {
    try { localStorage.setItem(PROGRESS_KEY, String(page)); } catch {}
  };

  const fetchComments = useCallback(async (bookId: string) => {
    try {
      const res = await fetch(`/api/comments?book_id=${bookId}`);
      if (res.ok) setComments(await res.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/books?id=${id}&include_volumes=true`);
        if (res.ok) {
          const data = await res.json();
          setBook(data);

          const bookVolumes = data.volumes || [];
          if (bookVolumes.length === 0 && data.file_url) {
            bookVolumes.push({ id: "legacy", book_id: data.id, title: "Full Book", file_url: data.file_url, created_at: data.created_at });
          }
          setVolumes(bookVolumes);

          const allRes = await fetch("/api/books");
          if (allRes.ok) {
            const all = await allRes.json();
            const related = all
              .filter((b: Book) => b.category === data.category && b.id !== data.id)
              .slice(0, 4);
            setRelatedBooks(related);
          }

          fetchComments(data.id);
          fetch("/api/books/stats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: data.id, type: "views" }),
          }).catch(() => {});
        }
      } catch {
        // ignore
      } finally {
        setSavedPage(loadProgress());
        setLoading(false);
      }
    }
    load();
  }, [id, fetchComments]);

  const bookPrice = book?.price || 25000;
  const bookPromoPrice = book?.promo_price || 0;
  const bookPromoText = book?.promo_text || "";
  const hasPromo = bookPromoPrice > 0 && bookPromoPrice < bookPrice;
  const activePrice = hasPromo ? bookPromoPrice : bookPrice;
  const priceFormatted = activePrice.toLocaleString("id-ID");
  const isPaid = book?.is_paid || false;
  const isScheduled = book?.status === "scheduled" && book?.scheduled_at && new Date(book.scheduled_at) > new Date();

  const handleDownload = (vol?: BookVolume) => {
    const url = vol?.file_url || book?.file_url;
    if (!url || !book) return;
    fetch("/api/books/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: book.id, type: "downloads" }),
    }).catch(() => {});
    window.open(url, "_blank");
  };

  const handleBuyWhatsApp = () => {
    if (!book) return;
    fetch("/api/books/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: book.id, type: "purchased" }),
    }).catch(() => {});
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    if (!book) return;
    const price = activePrice.toLocaleString("id-ID");
    const promoLine = hasPromo
      ? "\nHarga Normal: ~~Rp " + bookPrice.toLocaleString("id-ID") + "~~"
      : "";
    const msg = [
      "Assalamu'alaikum, saya sudah transfer untuk pembelian buku:",
      "",
      "*" + book.title + "*",
      "Harga: Rp " + price + promoLine,
      "",
      "Berikut bukti transfernya.",
    ].join("\n");
    setShowPaymentModal(false);
    window.open(
      "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg),
      "_blank"
    );
  };

  const handleOpenViewer = (vol?: BookVolume, startPage?: number) => {
    setSelectedVolume(vol || null);
    setShowViewer(true);
    setCurrentPage(startPage || 1);
    setPdfError(false);
    setPdfLoading(true);
  };

  useEffect(() => {
    if (showViewer) persistPage(currentPage);
  }, [currentPage, showViewer]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !commentName.trim() || !commentMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          name: commentName.trim(),
          message: commentMessage.trim(),
        }),
      });
      if (res.ok) {
        setCommentName("");
        setCommentMessage("");
        fetchComments(book.id);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted text-sm">Memuat buku...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📕</p>
          <h1 className="text-xl font-bold text-foreground mb-2">Buku Tidak Ditemukan</h1>
          <p className="text-muted text-sm mb-6">Buku yang kamu cari tidak tersedia.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm text-muted flex-wrap">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <li>
                <Link
                  href={`/?category=${encodeURIComponent(book.category)}`}
                  className="hover:text-primary transition-colors"
                >
                  {book.category}
                </Link>
              </li>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">
                {book.title}
              </li>
            </ol>
          </nav>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left: Cover */}
            <div className="w-full lg:w-[300px] lg:flex-shrink-0">
              <div className="glass rounded-2xl p-3 sm:p-5">
                <div className="relative aspect-[3/4] bg-surface-dark rounded-xl overflow-hidden">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      className="object-contain rounded-xl"
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                      <span className="text-6xl font-bold text-primary/20">
                        {book.title.charAt(0)}
                    </span>
                    </div>
                  )}
                  {isPaid && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-xl shadow-lg">
                      <Lock className="w-3.5 h-3.5" />
                      Rp {priceFormatted}
                    </div>
                  )}
                  {hasPromo && bookPromoText && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg">
                      {bookPromoText}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2.5 border-t border-border pt-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-muted">Kategori:</span>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {book.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-muted">Status:</span>
                      {isPaid ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                            Rp {priceFormatted}
                          </span>
                          {hasPromo && (
                            <>
                              <span className="text-[10px] text-muted line-through">
                                Rp {bookPrice.toLocaleString("id-ID")}
                              </span>
                              {bookPromoText && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  {bookPromoText}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          Gratis
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                      <span className="text-xs text-muted">
                        {new Date(book.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {(book.views > 0 || book.downloads > 0 || book.purchased > 0) && (
                      <div className="flex items-center gap-3">
                        {book.views > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-muted">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{formatNumber(book.views)}</span>
                          </div>
                        )}
                        {book.downloads > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-muted">
                            <Download className="w-3.5 h-3.5" />
                            <span>{formatNumber(book.downloads)}</span>
                          </div>
                        )}
                        {book.purchased > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-muted">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{formatNumber(book.purchased)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {book.title}
                </h1>
              </div>

              {/* Description */}
              <div className="glass rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
                <h2 className="text-sm font-semibold text-foreground mb-2">Deskripsi</h2>
                <div className="text-muted leading-relaxed text-xs sm:text-sm line-clamp-3">
                  {book.description || "Belum ada deskripsi untuk buku ini."}
                </div>
              </div>

              {/* Author & Translator */}
              {(book.author || book.translator) && (
                <div className="text-sm text-muted mb-4 space-y-1">
                  {book.author && (
                    <div>
                      Penulis: <span className="font-medium text-foreground">{book.author}</span>
                    </div>
                  )}
                  {book.translator && (
                    <div>
                      Penerjemah: <span className="font-medium text-foreground">{book.translator}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Volume List */}
              {isScheduled ? (
                <div className="glass rounded-2xl p-6 mb-4 sm:mb-6 border border-amber-500/30 bg-amber-500/5 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">Segera Terbit</h3>
                  <p className="text-xs text-muted">
                    Buku ini akan tersedia pada{" "}
                    {new Date(book!.scheduled_at!).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ) : volumes.length > 0 && (
                <div className="glass rounded-2xl overflow-hidden mb-4 sm:mb-6 border border-border/50">
                  <div className="px-4 sm:px-5 py-3 border-b border-border/50 bg-surface/30">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Daftar Jilid ({volumes.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-border/30">
                    {volumes.map((vol, idx) => (
                      <div key={vol.id || idx} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-surface/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {vol.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {savedPage > 0 ? (
                            <button
                              onClick={() => handleOpenViewer(vol, savedPage)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-accent rounded-xl hover:bg-accent/90 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              Lanjut (hlm {savedPage})
                            </button>
                          ) : null}
                          {isPaid ? (
                            <button
                              onClick={() => handleOpenViewer(vol)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Preview
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenViewer(vol)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                Baca
                              </button>
                              <button
                                onClick={() => handleDownload(vol)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground glass rounded-xl hover:bg-surface-dark transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isPaid && (
                <div className="glass rounded-2xl p-4 mb-4 sm:mb-6 border border-accent/20">
                  <p className="text-sm text-muted leading-relaxed">
                    <span className="font-semibold text-accent">Preview gratis:</span> Kamu bisa preview {MAX_FREE_PAGES} halaman pertama. Beli untuk membaca selengkapnya dan download PDF.
                  </p>
                </div>
              )}

              {isPaid && (
                <button
                  onClick={handleBuyWhatsApp}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-colors duration-300 shadow-lg shadow-green-600/15 mb-4 sm:mb-6"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Beli Rp {priceFormatted}
                </button>
              )}

              {/* Comments */}
              <div className="glass rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Komentar ({comments.length})
                  </h2>
                </div>

                <form onSubmit={handleSubmitComment} className="space-y-3 mb-6">
                  <input
                    type="text"
                    placeholder="Nama kamu"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-dark border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tulis komentar..."
                      value={commentMessage}
                      onChange={(e) => setCommentMessage(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-surface-dark border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !commentName.trim() || !commentMessage.trim()}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-muted">Belum ada komentar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3.5 bg-surface-dark rounded-2xl border border-border/50"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {comment.name}
                          </span>
                          <span className="text-xs text-muted ml-auto">
                            {new Date(comment.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted pl-9 leading-relaxed">
                          {comment.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-10 sm:mt-14"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-5">
                Buku Terkait
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {relatedBooks.map((rb) => (
                  <Link key={rb.id} href={`/book/${rb.id}`}>
                    <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10">
                      <div className="relative aspect-[3/4] bg-surface-dark">
                        {rb.cover_url ? (
                          <Image
                            src={rb.cover_url}
                            alt={rb.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <span className="text-3xl font-bold text-primary/30">
                              {rb.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        {rb.is_paid && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-accent/90 text-white text-[10px] font-bold rounded-lg">
                            <Lock className="w-3 h-3" />
                            Berbayar
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                          {rb.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {rb.category}
                          </span>
                          {!rb.is_paid && (
                            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Gratis
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* PDF Viewer Modal */}
      {showViewer && (selectedVolume?.file_url || book?.file_url) && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
          <div className="flex flex-col gap-2 px-3 py-2 sm:px-4 sm:py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => { persistPage(currentPage); setShowViewer(false); }}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-xl hover:bg-surface-dark transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                    {book?.title}
                  </h2>
                  {selectedVolume && (
                    <p className="text-[10px] sm:text-xs text-muted truncate">{selectedVolume.title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {isPaid && (
                  <button
                    onClick={handleBuyWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Beli Rp {priceFormatted}</span>
                  </button>
                )}
                {!isPaid && (
                  <button
                    onClick={() => handleDownload(selectedVolume || undefined)}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
            </div>
            {saveFeedback && (
              <div className="flex justify-center">
                <span className="text-[10px] text-accent">Posisi halaman tersimpan</span>
              </div>
            )}
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#f0f0f0] dark:bg-surface-dark">
            {pdfError ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
                <FileText className="w-12 h-12 text-muted mb-3" />
                <p className="text-sm text-muted">Gagal memuat PDF. Coba buka melalui Google Drive.</p>
                <a
                  href={getEmbedUrl(selectedVolume?.file_url || book?.file_url || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Buka di Google Drive
                </a>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div
                  className="flex-1 overflow-auto flex flex-col items-center py-4"
                  onTouchStart={e => { swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
                  onTouchEnd={e => {
                    const dx = e.changedTouches[0].clientX - swipeRef.current.x;
                    const dy = e.changedTouches[0].clientY - swipeRef.current.y;
                    if (!flipRef.current && Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 50) {
                      goPage(dx > 0 ? -1 : 1);
                    }
                  }}
                >
                  {pdfLoading && (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                  <Document
                    file={`/api/pdf-proxy?url=${encodeURIComponent(selectedVolume?.file_url || book?.file_url || "")}`}
                    onLoadSuccess={({ numPages: pages }) => { setNumPages(pages); numPagesRef.current = pages; setPdfLoading(false); }}
                    onLoadError={() => { setPdfError(true); setPdfLoading(false); }}
                    loading={null}
                  >
                    <div className="relative flex justify-center px-4" style={{ perspective: "1500px" }}>
                      {flipDir !== 0 && (
                        <div className="absolute inset-0 flex justify-center" style={{ backfaceVisibility: "hidden" }}>
                          <Page
                            pageNumber={Math.max(1, Math.min(numPagesRef.current, currentPage + flipDir))}
                            width={typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 900) : 800}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>
                      )}
                      <div style={{
                        transform: `rotateY(${flipAngle}deg)`,
                        transition: "transform 0.35s ease-in-out",
                        transformOrigin: flipDir > 0 ? "left" : "right",
                        backfaceVisibility: "hidden",
                      }}>
                        <Page
                          pageNumber={currentPage}
                          width={typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 900) : 800}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>
                    </div>
                  </Document>
                </div>
                <div className="flex-shrink-0 grid grid-cols-3 items-center px-2 py-1.5 border-t border-border bg-background/95 backdrop-blur-sm">
                  <button
                    onClick={() => goPage(-1)}
                    disabled={currentPage <= 1}
                    className="justify-self-start flex items-center gap-0.5 px-2 py-1.5 text-xs font-medium rounded-lg bg-surface-dark text-muted hover:bg-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <div className="justify-self-center flex items-center gap-1.5">
                    <span className="text-xs text-muted">
                      {currentPage} / {numPages > 0 ? (isPaid ? Math.min(numPages, MAX_FREE_PAGES) : numPages) : "?"}
                    </span>
                    <button
                      onClick={() => { persistPage(currentPage); setSaveFeedback(true); setTimeout(() => setSaveFeedback(false), 1500); }}
                      className={`flex items-center gap-0.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${saveFeedback ? "bg-accent/20 text-accent" : "bg-surface-dark text-muted hover:text-accent hover:bg-accent/10"}`}
                    >
                      <BookmarkCheck className={`w-3.5 h-3.5 ${saveFeedback ? "fill-current" : ""}`} />
                      <span className="hidden sm:inline">{saveFeedback ? "Tersimpan" : "Simpan"}</span>
                    </button>
                    <button
                      onClick={() => { window.speechSynthesis?.cancel(); setTtsChunks([]); setTtsStatus("extracting"); setTtsMsg(`Mengekstrak halaman ${currentPage}...`); setTtsKey(k => k + 1); }}
                      className="flex items-center gap-0.5 px-2 py-1.5 text-xs font-medium rounded-lg bg-surface-dark text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Dengarkan</span>
                    </button>
                  </div>
                  <div className="justify-self-end flex items-center gap-1">
                    {isPaid && currentPage >= MAX_FREE_PAGES && numPages > 0 && (
                      <button
                        onClick={handleBuyWhatsApp}
                        className="flex items-center gap-0.5 px-2 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <ShoppingCart className="w-3 w-3" />
                        <span className="hidden sm:inline">Beli</span>
                      </button>
                    )}
                    <button
                      onClick={() => goPage(1)}
                      disabled={numPages === 0 || (isPaid ? currentPage >= Math.min(numPages, MAX_FREE_PAGES) : currentPage >= numPages)}
                      className="flex items-center gap-0.5 px-2 py-1.5 text-xs font-medium rounded-lg bg-surface-dark text-muted hover:bg-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && book && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full border border-accent/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Info Pembayaran</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-surface-dark transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-dark rounded-xl p-4 text-center">
                <p className="text-sm text-muted mb-1">Transfer ke</p>
                <p className="font-bold text-lg text-foreground">Bank BSI</p>
                <p className="text-2xl font-bold text-accent tracking-wider mt-1">
                  9700707005
                </p>
                <p className="text-sm text-muted mt-1">a.n. YUVI ADS INDONESIA</p>
              </div>

              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-muted">Total Pembayaran</span>
                <span className="font-semibold text-foreground">
                  Rp {priceFormatted}
                </span>
              </div>

              <button
                onClick={handlePaymentConfirm}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Konfirmasi via WhatsApp
              </button>

              <p className="text-xs text-muted text-center">
                Klik konfirmasi setelah transfer, lalu kirim bukti transfer via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {showTTS && ttsStatus === "extracting" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-8 shadow-2xl border border-border flex flex-col items-center gap-4 max-w-xs w-full mx-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-foreground font-medium text-center">{ttsMsg}</p>
            <button onClick={() => { window.speechSynthesis?.cancel(); setTtsKey(0); setTtsStatus("idle"); setTtsChunks([]); }} className="text-xs text-muted hover:text-foreground underline">
              Batal
            </button>
          </div>
        </div>
      )}

      {showTTS && ttsStatus === "error" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-8 shadow-2xl border border-border flex flex-col items-center gap-4 max-w-xs w-full mx-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-foreground font-medium text-center">{ttsMsg}</p>
            <button onClick={() => { setTtsKey(0); setTtsStatus("idle"); setTtsChunks([]); }} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}

      {showTTS && ttsChunks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[200] bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
          <div className="h-0.5 bg-surface-dark">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${ttsChunks.length > 0 ? ((ttsIdx + 1) / ttsChunks.length) * 100 : 0}%` }} />
          </div>
          <div className="relative flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5">
            <button onClick={() => { window.speechSynthesis?.cancel(); setTtsKey(0); setTtsStatus("idle"); setTtsChunks([]); }} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors">
              <X className="w-4 h-4" />
            </button>
            <button onClick={ttsPrev} disabled={ttsIdx === 0} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={ttsStatus === "playing" ? ttsPause : ttsPlay} className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
              {ttsStatus === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={ttsNext} disabled={ttsIdx >= ttsChunks.length - 1} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={ttsStop} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors">
              <Square className="w-4 h-4" />
            </button>
            <button onClick={() => { const sp = [0.75, 1, 1.25, 1.5, 2]; const i = sp.indexOf(ttsSpeed); const ns = sp[(i + 1) % sp.length]; setTtsSpeed(ns); if (ttsStatus === "playing") { window.speechSynthesis?.cancel(); ttsSpeak(ttsIdxRef.current); } }} className="px-2 py-1 text-xs font-semibold rounded-lg bg-surface-dark text-muted hover:text-foreground transition-colors">
              {ttsSpeed}x
            </button>
            <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="hidden sm:inline text-xs text-muted">{ttsIdx + 1}/{ttsChunks.length}</span>
              <Volume2 className="hidden sm:block w-3.5 h-3.5 text-muted" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

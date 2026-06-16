"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Code2,
  MapPin,
  BookOpen,
  Sparkles,
  Heart,
  Phone,
  BookMarked,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Book } from "@/lib/types";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function CollapsibleSection({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass rounded-3xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 sm:p-8 hover:bg-surface-dark/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-8 pb-5 sm:pb-8 border-t border-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  const [progressBooks, setProgressBooks] = useState<(Book & { progress: number })[]>([]);
  const [completedBooks, setCompletedBooks] = useState<(Book & { progress: number })[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    const progressKeys: { id: string; page: number }[] = [];
    const completedIds: string[] = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("book_progress_")) {
          const id = key.replace("book_progress_", "");
          const page = parseInt(localStorage.getItem(key) || "0", 10);
          if (page > 0) progressKeys.push({ id, page });
        }
        if (key?.startsWith("book_completed_")) {
          completedIds.push(key.replace("book_completed_", ""));
        }
      }
    } catch {
      // localStorage not available
    }

    if (progressKeys.length === 0 && completedIds.length === 0) {
      setLoadingProgress(false);
      return;
    }

    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        const allBooks = data as Book[];
        setProgressBooks(
          allBooks
            .filter((b) => progressKeys.some((k) => k.id === b.id) && !completedIds.includes(b.id))
            .map((b) => ({
              ...b,
              progress: progressKeys.find((k) => k.id === b.id)?.page || 0,
            }))
        );
        setCompletedBooks(
          allBooks
            .filter((b) => completedIds.includes(b.id))
            .map((b) => ({
              ...b,
              progress: progressKeys.find((k) => k.id === b.id)?.page || 0,
            }))
        );
      })
      .catch(() => {
        setProgressBooks([]);
        setCompletedBooks([]);
      })
      .finally(() => setLoadingProgress(false));
  }, []);

  const markComplete = (e: React.MouseEvent, book: Book & { progress: number }) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(`book_completed_${book.id}`, "true");
      localStorage.removeItem(`book_progress_${book.id}`);
    } catch {}
    setProgressBooks((prev) => prev.filter((b) => b.id !== book.id));
    setCompletedBooks((prev) => [...prev, { ...book, progress: 0 }]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* ── Lanjutkan Membaca ── */}
          <div className="glass rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <BookMarked className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Lanjutkan Membaca</h2>
            </div>

            {loadingProgress ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 skeleton-shimmer rounded-xl h-[64px]" />
                ))}
              </div>
            ) : progressBooks.length === 0 && completedBooks.length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-muted">Belum ada buku yang dibaca</p>
                <Link
                  href="/"
                  className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                >
                  Mulai membaca dari halaman utama
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {progressBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/book/${book.id}`}
                    className="flex items-center gap-3 p-3 bg-surface-dark rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="relative w-10 h-14 sm:w-12 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-surface">
                      {book.cover_url ? (
                        <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <BookOpen className="w-4 h-4 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {book.title}
                      </p>
                      {book.author && (
                        <p className="text-[11px] text-muted truncate">{book.author}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-1 rounded-lg">
                        hlm {book.progress}
                      </span>
                      <button
                        onClick={(e) => markComplete(e, book)}
                        className="p-1.5 rounded-lg text-muted/50 hover:text-green-500 hover:bg-green-500/10 transition-all duration-200"
                        title="Tandai selesai"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {completedBooks.length > 0 && (
            <CollapsibleSection icon={CheckCircle2} title={`Selesai Dibaca (${completedBooks.length})`}>
              <div className="space-y-2 pt-5 sm:pt-6">
                {completedBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/book/${book.id}`}
                    className="flex items-center gap-3 p-3 bg-surface-dark rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="relative w-10 h-14 sm:w-12 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-surface">
                      {book.cover_url ? (
                        <Image src={book.cover_url} alt={book.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <BookOpen className="w-4 h-4 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {book.title}
                      </p>
                      {book.author && (
                        <p className="text-[11px] text-muted truncate">{book.author}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-green-600 bg-green-500/10 px-2 py-1 rounded-lg font-medium shrink-0">
                      Selesai
                    </span>
                  </Link>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* ── Collapsible Sections ── */}
          <CollapsibleSection icon={Sparkles} title="Tentang Pengembang">
            <div className="text-center space-y-5 pt-5 sm:pt-6">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden shadow-xl shadow-primary/15 ring-4 ring-primary/15">
                <Image
                  src="https://fxqghtotzvapeynaqngg.supabase.co/storage/v1/object/sign/Cover%20Buku/Fotoku.JPG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YjY4OGEzNS05NzkwLTRiNDktYmRkNC1lYTNiYjFlNmM0YWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3ZlciBCdWt1L0ZvdG9rdS5KUEciLCJpYXQiOjE3NzgyNDg1MDAsImV4cCI6MTkzNTkyODUwMH0.8xuk8HUjxQECMkn9IJQibWGF5BtqIAx_zZL7zdl8JSw"
                  alt="Yulianto Abu Hanna"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Yulianto Abu Hanna</h3>
                <p className="text-base text-muted mt-1">Full-Stack Developer & Founder YAIAPPS</p>
              </div>
              <p className="text-muted max-w-lg mx-auto leading-relaxed text-sm">
                Membangun solusi website untuk dakwah, pendidikan, dan berbagai
                kebutuhan digital Indonesia.
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <MapPin className="w-3.5 h-3.5" />
                  Indonesia
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent text-xs font-medium rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  Literasi Digital
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  <Code2 className="w-3.5 h-3.5" />
                  Next.js + Supabase
                </span>
              </div>
              <div className="space-y-3 text-muted leading-relaxed text-sm text-left max-w-lg mx-auto border-t border-border pt-5">
                <p>
                  Perpustakaan Digital MSI adalah platform perpustakaan digital yang
                  dirancang untuk memberikan akses mudah ke berbagai koleksi buku
                  elektronik. Platform ini dibangun dengan teknologi modern untuk
                  memberikan pengalaman membaca yang nyaman dan menyenangkan.
                </p>
                <p>
                  Dengan antarmuka yang bersih dan modern, kami berkomitmen untuk
                  membuat literasi lebih mudah diakses oleh semua orang, di mana
                  saja dan kapan saja.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Code2} title="Teknologi">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 sm:pt-6">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "Supabase",
                "PostgreSQL",
                "Framer Motion",
                "Lucide Icons",
              ].map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-3 glass rounded-xl text-sm font-medium text-foreground text-center"
                >
                  {tech}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection icon={Heart} title="Kontak & Sosial Media">
            <div className="grid grid-cols-2 gap-3 pt-5 sm:pt-6">
              <a
                href="https://www.instagram.com/yuliantoabuhanna?igsh=dXZkbWl1cjhqdG00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-pink-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-pink-500/15 rounded-xl flex items-center justify-center group-hover:bg-pink-500/25 transition-colors">
                  <InstagramIcon className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Instagram</p>
                  <p className="text-xs text-muted">@yuliantoabuhanna</p>
                </div>
              </a>
              <a
                href="https://wa.me/6281297007070"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-green-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">WhatsApp</p>
                  <p className="text-xs text-muted">081297007070</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@yuvidotid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-red-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center group-hover:bg-red-500/25 transition-colors">
                  <YoutubeIcon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">YouTube</p>
                  <p className="text-xs text-muted">@yuvidotid</p>
                </div>
              </a>
              <a
                href="https://id.linkedin.com/in/yuli-anto-abu-hanna-2129ab314"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-blue-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                  <LinkedinIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">LinkedIn</p>
                  <p className="text-xs text-muted">Yuli Anto Abu Hanna</p>
                </div>
              </a>
            </div>
          </CollapsibleSection>

          {/* ── Back Link ── */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              <BookOpen className="w-5 h-5" />
              Kembali ke Perpustakaan
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

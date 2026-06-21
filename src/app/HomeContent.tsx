"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import BookRequestModal from "@/components/BookRequestModal";
import {
  BookGridSkeleton,
  SectionSkeleton,
} from "@/components/Skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  Layers,
  BookOpen,
  Users,
  Gift,
  Gem,
  Star,
  Library,
  Hash,
  ArrowRight,
  Clock,
  Eye,
} from "lucide-react";

const GRID_CLASSES = "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3 sm:gap-4";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useCallback((node: HTMLSpanElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500;
          const step = Math.ceil(value / (duration / 16));
          const timer = setInterval(() => {
            start += step;
            if (start >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString("id-ID")}{suffix}</span>;
}

function OnlineReaderCount() {
  const getTarget = (hour: number): number => {
    if (hour >= 0 && hour <= 4) return 1247;
    if (hour === 5) return 4321;
    if (hour === 6) return 7688;
    if (hour === 7) return 11234;
    if (hour === 8) return 14567;
    if (hour === 9) return 15892;
    if (hour === 10) return 17345;
    if (hour === 11) return 18923;
    if (hour === 12) return 20456;
    if (hour === 13) return 21567;
    if (hour === 14) return 22789;
    if (hour === 15) return 23456;
    if (hour === 16) return 24789;
    if (hour === 17) return 25678;
    if (hour === 18) return 26789;
    if (hour === 19) return 27567;
    if (hour === 20) return 26456;
    if (hour === 21) return 20789;
    if (hour === 22) return 15432;
    if (hour === 23) return 8765;
    return 1000;
  };

  const [count, setCount] = useState(() => getTarget(new Date().getHours()));

  useEffect(() => {
    const next = () => {
      const delay = 15000 + Math.random() * 15000;
      return setTimeout(() => {
        setCount((prev) => {
          const target = getTarget(new Date().getHours());
          const diff = target - prev;
          const step = diff * 0.3;
          const noise = (Math.random() - 0.5) * prev * 0.06;
          return Math.max(500, prev + step + noise);
        });
      }, delay);
    };
    const timer = next();
    return () => clearTimeout(timer);
  }, [count]);

  return <>{formatNumber(count)} membaca</>;
}

function MiniStats({ totalBooks, totalVisitors, totalCategories, totalFree }: { totalBooks: number; totalVisitors: number; totalCategories: number; totalFree: number }) {
  const stats = [
    { label: "Buku Tersedia", value: totalBooks, icon: Library, color: "from-emerald-500 to-emerald-600" },
    { label: "Pengunjung", value: totalVisitors, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Kategori", value: totalCategories, icon: Hash, color: "from-amber-500 to-amber-600" },
    { label: "Gratis", value: totalFree, icon: Gift, color: "from-violet-500 to-violet-600" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-x-6">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex items-center gap-1">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded sm:rounded-md bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
            <stat.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground">
            <AnimatedCounter value={stat.value} />
          </span>
          <span className="hidden sm:inline text-xs text-muted whitespace-nowrap">{stat.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded sm:rounded-md bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        </div>
        <span className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <OnlineReaderCount />
        </span>
      </div>
    </div>
  );
}


function SectionHeader({
  icon: Icon,
  title,
  showAll,
  isExpanded,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  showAll: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {showAll && (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light transition-colors group"
        >
          {isExpanded ? "Tutup" : "Lihat Semua"}
          <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
        </button>
      )}
    </div>
  );
}

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState(5000000);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (categoryQuery) params.set("category", categoryQuery);

      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        const uniqueCategories = [...new Set(data.map((b: Book) => b.category).filter(Boolean) as string[])];
        setCategories(uniqueCategories);
      }
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryQuery]);

  useEffect(() => {
    fetchBooks();
    fetch("/api/visitor", { method: "POST" });
    fetch("/api/visitor")
      .then((r) => r.json())
      .then((d) => setVisitorCount(5000000 + (d.count || 0)))
      .catch(() => {});
  }, [fetchBooks]);

  const liveBooks = books.filter(
    (b) => b.status !== "scheduled" || !b.scheduled_at || new Date(b.scheduled_at) <= new Date()
  );
  const upcomingBooks = books.filter(
    (b) => b.status === "scheduled" && b.scheduled_at && new Date(b.scheduled_at) > new Date()
  );
  const trendingBooks = [...liveBooks].sort((a, b) => (b.views || 0) - (a.views || 0));
  const newBooks = [...liveBooks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const newestIds = new Set(newBooks.slice(0, 10).map((b) => b.id));
  const freeBooks = newBooks.filter((b) => !b.is_paid && !newestIds.has(b.id));
  const paidBooks = newBooks.filter((b) => b.is_paid);
  const categoryPicks: Book[] = [];
  const categorySeen = new Set<string>();
  for (const book of liveBooks) {
    if (!categorySeen.has(book.category)) {
      categorySeen.add(book.category);
      categoryPicks.push(book);
    }
  }

  if (searchQuery || categoryQuery) {
    return (
      <div className="pt-28 pb-12 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors duration-200 mb-4 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </button>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {searchQuery
              ? `Hasil pencarian: "${searchQuery}"`
              : `Kategori: ${categoryQuery}`}
          </h2>
          <p className="text-muted">
            {loading ? "Mencari..." : `${books.length} buku ditemukan`}
          </p>
        </div>
        {loading ? (
          <BookGridSkeleton count={books.length || 20} />
        ) : books.length === 0 ? (
          <>
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-surface-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Buku tidak ditemukan
              </h3>
              <p className="text-muted mb-6">Coba kata kunci lain atau jelajahi kategori.</p>
              <button
                onClick={() => setRequestModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-2xl hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
              >
                <BookOpen className="w-4 h-4" />
                Usulkan Buku Ini
              </button>
            </div>
            <BookRequestModal
              isOpen={requestModalOpen}
              onClose={() => setRequestModalOpen(false)}
              searchQuery={searchQuery}
            />
          </>
        ) : (
          <div className={GRID_CLASSES}>
            {books.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const defaultLimit = 24;
  const freeLimit = 20;

  return (
    <>
      <Hero compact />

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="space-y-6 sm:space-y-12">

          <MiniStats totalBooks={books.length} totalVisitors={visitorCount} totalCategories={categories.length} totalFree={freeBooks.length} />

          {upcomingBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <SectionHeader
                icon={Clock}
                title="Segera Launching"
                showAll={false}
                isExpanded={false}
                onToggle={() => {}}
              />
              <div className={GRID_CLASSES}>
                {upcomingBooks.slice(0, 10).map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
          )}

          {/* ── Buku Terbaru ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <SectionHeader
                icon={Clock}
                title="Buku Terbaru"
                showAll={newBooks.length > defaultLimit}
                isExpanded={!!expanded.baru}
                onToggle={() => toggleExpand("baru")}
              />
              {loading ? (
                <SectionSkeleton />
              ) : (
                <div className={GRID_CLASSES}>
                  {(expanded.baru ? newBooks : newBooks.slice(0, defaultLimit)).map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} isNew={newestIds.has(book.id)} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Ebook Premium ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                    <Gem className="w-5 h-5 text-amber-500" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Ebook Premium</h2>
                </div>
                {paidBooks.length > defaultLimit && (
                  <button
                    onClick={() => toggleExpand("berbayar")}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light transition-colors group"
                  >
                    {expanded.berbayar ? "Tutup" : "Lihat Semua"}
                    <ArrowRight className={`w-4 h-4 transition-transform ${expanded.berbayar ? "rotate-90" : "group-hover:translate-x-0.5"}`} />
                  </button>
                )}
              </div>
              {loading ? (
                <SectionSkeleton />
              ) : paidBooks.length > 0 ? (
                <div className={GRID_CLASSES}>
                  {(expanded.berbayar ? paidBooks : paidBooks.slice(0, defaultLimit)).map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* ── Kategori Buku ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Layers className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Kategori Buku</h2>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl p-3 skeleton-shimmer h-16" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                  {categories.slice(0, 6).map((cat, i) => {
                    const colors = [
                      { from: "from-emerald-500/20", to: "to-emerald-600/10", icon: BookOpen },
                      { from: "from-blue-500/20", to: "to-blue-600/10", icon: Library },
                      { from: "from-amber-500/20", to: "to-amber-600/10", icon: Star },
                      { from: "from-rose-500/20", to: "to-rose-600/10", icon: BookOpen },
                      { from: "from-violet-500/20", to: "to-violet-600/10", icon: Gem },
                      { from: "from-teal-500/20", to: "to-teal-600/10", icon: Hash },
                    ];
                    const c = colors[i % colors.length];
                    const Icon = c.icon;
                    return (
                      <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`}>
                        <motion.div
                          whileHover={{ scale: 1.02, x: 1 }}
                          className="glass rounded-xl p-2 sm:p-2.5 border border-border/40 hover:shadow-md transition-all duration-200 group cursor-pointer flex items-center gap-2"
                        >
                          <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                          </div>
                          <h3 className="text-[11px] sm:text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight truncate">{cat}</h3>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Ebook Gratis ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <SectionHeader
                icon={Gift}
                title="Ebook Gratis"
                showAll={freeBooks.length > freeLimit}
                isExpanded={!!expanded.free}
                onToggle={() => toggleExpand("free")}
              />
              {loading ? (
                <SectionSkeleton count={freeLimit} />
              ) : freeBooks.length > 0 ? (
                <div className={GRID_CLASSES}>
                  {(expanded.free ? freeBooks : freeBooks.slice(0, freeLimit)).map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* ── Buku Populer ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <SectionHeader
                icon={TrendingUp}
                title="Buku Populer"
                showAll={trendingBooks.length > defaultLimit}
                isExpanded={!!expanded.populer}
                onToggle={() => toggleExpand("populer")}
              />
              {loading ? (
                <SectionSkeleton />
              ) : (
                <div className={GRID_CLASSES}>
                  {(expanded.populer ? trendingBooks : trendingBooks.slice(0, defaultLimit)).map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Buku Berdasarkan Kategori ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <SectionHeader
                icon={Star}
                title="Buku Berdasarkan Kategori"
                showAll={categoryPicks.length > defaultLimit}
                isExpanded={!!expanded.kategori}
                onToggle={() => toggleExpand("kategori")}
              />
              {loading ? (
                <SectionSkeleton />
              ) : categoryPicks.length > 0 ? (
                <div className={GRID_CLASSES}>
                  {(expanded.kategori ? categoryPicks : categoryPicks.slice(0, defaultLimit)).map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

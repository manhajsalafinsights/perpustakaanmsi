"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book } from "@/lib/types";
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
  BadgeDollarSign,
  Star,
  Library,
  Sparkles,
  Hash,
  ArrowRight,
  Clock,
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

function StatsSection({ totalBooks, totalVisitors, totalCategories, totalFree }: { totalBooks: number; totalVisitors: number; totalCategories: number; totalFree: number }) {
  const stats = [
    { label: "Buku Tersedia", value: totalBooks, icon: Library, color: "from-emerald-500 to-emerald-600" },
    { label: "Pengunjung", value: totalVisitors, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Kategori", value: totalCategories, icon: Hash, color: "from-amber-500 to-amber-600" },
    { label: "Gratis", value: totalFree, icon: Gift, color: "from-violet-500 to-violet-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="glass rounded-2xl p-4 sm:p-5 border border-border/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-sm`}>
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            <AnimatedCounter value={stat.value} />
          </p>
          <p className="text-xs text-muted mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function FeaturedCategoryCard({ name, index }: { name: string; index: number }) {
  const colors = [
    { from: "from-emerald-500/20", to: "to-emerald-600/10", icon: BookOpen },
    { from: "from-blue-500/20", to: "to-blue-600/10", icon: Library },
    { from: "from-amber-500/20", to: "to-amber-600/10", icon: Star },
    { from: "from-rose-500/20", to: "to-rose-600/10", icon: BookOpen },
    { from: "from-violet-500/20", to: "to-violet-600/10", icon: Sparkles },
    { from: "from-teal-500/20", to: "to-teal-600/10", icon: BookOpen },
  ];
  const color = colors[index % colors.length];

  return (
    <Link href={`/?category=${encodeURIComponent(name)}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-border/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
      >
        <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
          <color.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-[10px] sm:text-xs text-muted mt-0.5 sm:mt-1">Jelajahi buku {name.toLowerCase()}</p>
      </motion.div>
    </Link>
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

  const trendingBooks = [...books].sort((a, b) => (b.views || 0) - (a.views || 0));
  const newBooks = [...books].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const newestIds = new Set(newBooks.slice(0, 10).map((b) => b.id));
  const freeBooks = newBooks.filter((b) => !b.is_paid && !newestIds.has(b.id));
  const paidBooks = newBooks.filter((b) => b.is_paid);
  const categoryPicks: Book[] = [];
  const categorySeen = new Set<string>();
  for (const book of newBooks) {
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

  const defaultLimit = 10;
  const freeLimit = 20;

  return (
    <>
      <Hero compact />

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="space-y-8 sm:space-y-12">

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

          {/* ── Kategori Buku ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Kategori Buku
                </h2>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass rounded-2xl p-5 skeleton-shimmer h-28" />
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                {categories.slice(0, 6).map((cat, i) => (
                  <FeaturedCategoryCard key={cat} name={cat} index={i} />
                ))}
              </div>
              )}
            </div>
          </motion.div>

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

          {/* ── Ebook Berbayar ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <SectionHeader
                icon={BadgeDollarSign}
                title="Ebook Berbayar"
                showAll={paidBooks.length > defaultLimit}
                isExpanded={!!expanded.berbayar}
                onToggle={() => toggleExpand("berbayar")}
              />
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

          {/* ── Stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <StatsSection totalBooks={books.length} totalVisitors={visitorCount} totalCategories={categories.length} totalFree={freeBooks.length} />
          </motion.div>

        </div>
      </div>
    </>
  );
}

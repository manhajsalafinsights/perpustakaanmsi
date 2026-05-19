"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book } from "@/lib/types";
import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import {
  BookCardSkeleton,
  BookGridSkeleton,
  SectionSkeleton,
} from "@/components/Skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  BookOpen,
  Users,
  Gift,
  BadgeDollarSign,
  Star,
  BookMarked,
  Library,
  Sparkles,
  Quote,
  Hash,
  Eye,
  ArrowRight,
} from "lucide-react";

function ScrollContainer({
  children,
  title,
  icon: Icon,
}: {
  children: React.ReactNode;
  title: string;
  icon: React.ElementType;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            {title}
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-dark border border-border/50 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:text-foreground hover:bg-surface-dark border border-border/50 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
      >
        {children}
      </div>
    </div>
  );
}

function StatsSection({ totalBooks, totalVisitors }: { totalBooks: number; totalVisitors: number }) {
  const stats = [
    { label: "Buku Tersedia", value: totalBooks, icon: Library, color: "from-emerald-500 to-emerald-600" },
    { label: "Pengunjung", value: totalVisitors, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Kategori", value: 8, icon: Hash, color: "from-amber-500 to-amber-600" },
    { label: "Gratis", value: Math.floor(totalBooks * 0.6), icon: Gift, color: "from-violet-500 to-violet-600" },
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
          className="glass rounded-2xl p-4 sm:p-5 border border-border/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center mb-3`}>
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function QuoteSection() {
  const quotes = [
    { text: "Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan baginya jalan menuju surga.", source: "HR. Muslim" },
    { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", source: "HR. Ahmad" },
    { text: "Tuntutlah ilmu dari buaian hingga liang lahat.", source: "HR. Muslim" },
    { text: "Ilmu tanpa amal bagaikan pohon tanpa buah.", source: "Ali bin Abi Thalib" },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 border border-primary/10 p-6 sm:p-10"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      <div className="relative flex items-start gap-4 sm:gap-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <AnimatedQuote key={current} quote={quotes[current]} />
          <div className="flex gap-1.5 mt-4">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  i === current ? "bg-primary w-4" : "bg-primary/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedQuote({ quote }: { quote: { text: string; source: string } }) {
  return (
    <motion.div
      key={quote.text}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <blockquote className="text-base sm:text-lg lg:text-xl font-medium text-foreground leading-relaxed italic">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-sm text-muted mt-2">{quote.source}</p>
    </motion.div>
  );
}

function FeaturedCategoryCard({ name, index }: { name: string; index: number }) {
  const colors = [
    { from: "from-emerald-500/20", to: "to-emerald-600/10", icon: BookOpen },
    { from: "from-blue-500/20", to: "to-blue-600/10", icon: BookMarked },
    { from: "from-amber-500/20", to: "to-amber-600/10", icon: Star },
    { from: "from-rose-500/20", to: "to-rose-600/10", icon: Library },
    { from: "from-violet-500/20", to: "to-violet-600/10", icon: Sparkles },
    { from: "from-teal-500/20", to: "to-teal-600/10", icon: BookOpen },
  ];
  const color = colors[index % colors.length];

  return (
    <Link href={`/?category=${encodeURIComponent(name)}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        className="glass rounded-2xl p-4 sm:p-5 border border-border/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-pointer"
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
          <color.icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-xs text-muted mt-1">Jelajahi buku {name.toLowerCase()}</p>
      </motion.div>
    </Link>
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

  const handleCategorySelect = (cat: string) => {
    if (cat) {
      router.push(`/?category=${encodeURIComponent(cat)}`);
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    fetchBooks();
    fetch("/api/visitor", { method: "POST" });
    fetch("/api/visitor")
      .then((r) => r.json())
      .then((d) => setVisitorCount(5000000 + (d.count || 0)))
      .catch(() => {});
  }, [fetchBooks]);

  const trendingBooks = [...books].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const newBooks = [...books].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const newestIds = new Set(newBooks.slice(0, 5).map((b) => b.id));
  const freeBooks = newBooks.filter((b) => !b.is_paid);
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
      <div className="pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors duration-200 mb-4 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
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
          <BookGridSkeleton />
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-surface-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Buku tidak ditemukan
            </h3>
            <p className="text-muted">Coba kata kunci lain atau jelajahi kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {books.map((book, i) => (
              <BookCard
                key={book.id}
                book={book}
                index={i}
                isNew={newestIds.has(book.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Hero />

      <div id="trending" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="space-y-16 sm:space-y-20">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <StatsSection totalBooks={books.length} totalVisitors={visitorCount} />
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {!loading && categories.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handleCategorySelect("")}
                  className="px-4 py-2 rounded-full text-xs font-medium transition-colors bg-primary text-white shadow-sm"
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 glass border border-border/40 hover:bg-surface-dark hover:border-primary/20"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Trending Books */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <SectionSkeleton />
            ) : (
              <ScrollContainer title="Trending" icon={TrendingUp}>
                {trendingBooks.map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={i}
                    isNew={newestIds.has(book.id)}
                    variant="scroll"
                  />
                ))}
              </ScrollContainer>
            )}
          </motion.div>

          {/* Quote */}
          <QuoteSection />

          {/* Featured Categories */}
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
                  Jelajahi Kategori
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.slice(0, 6).map((cat, i) => (
                  <FeaturedCategoryCard key={cat} name={cat} index={i} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Free Books */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <SectionSkeleton />
            ) : freeBooks.length > 0 ? (
              <ScrollContainer title="Ebook Gratis" icon={Gift}>
                {freeBooks.slice(0, 8).map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={i}
                    isNew={newestIds.has(book.id)}
                    variant="scroll"
                  />
                ))}
              </ScrollContainer>
            ) : null}
          </motion.div>

          {/* Paid Books */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <SectionSkeleton />
            ) : paidBooks.length > 0 ? (
              <ScrollContainer title="Ebook Berbayar" icon={BadgeDollarSign}>
                {paidBooks.slice(0, 8).map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={i}
                    isNew={newestIds.has(book.id)}
                    variant="scroll"
                  />
                ))}
              </ScrollContainer>
            ) : null}
          </motion.div>

          {/* Category Picks */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <SectionSkeleton />
            ) : categoryPicks.length > 0 ? (
              <ScrollContainer title="Koleksi Unggulan" icon={Star}>
                {categoryPicks.map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={i}
                    isNew={newestIds.has(book.id)}
                    variant="scroll"
                  />
                ))}
              </ScrollContainer>
            ) : null}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 sm:p-12 text-center border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Siap Mulai Membaca?
            </h2>
            <p className="text-muted max-w-md mx-auto mb-6">
              Jelajahi ribuan koleksi buku islami pilihan. Gratis dan mudah.
            </p>
            <Link
              href="#books"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/15 hover:shadow-xl"
            >
              <Eye className="w-5 h-5" />
              Jelajahi Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}

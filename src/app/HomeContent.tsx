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
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
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
  ChevronDown,
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
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory"
        >
        {children}
      </div>
    </div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString("id-ID")}{suffix}</span>;
}

function StatsSection({ totalBooks, totalVisitors, totalCategories }: { totalBooks: number; totalVisitors: number; totalCategories: number }) {
  const stats = [
    { label: "Buku Tersedia", value: totalBooks, icon: Library, color: "from-emerald-500 to-emerald-600" },
    { label: "Pengunjung", value: totalVisitors, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Kategori", value: totalCategories, icon: Hash, color: "from-amber-500 to-amber-600" },
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

      {/* Section separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mx-4 sm:mx-8 lg:mx-auto max-w-7xl" />

      <div id="trending" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="space-y-16 sm:space-y-20">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <StatsSection totalBooks={books.length} totalVisitors={visitorCount} totalCategories={categories.length} />
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
                  className={`px-5 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                    !categoryQuery
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "glass border border-border/40 text-muted hover:bg-surface-dark hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-5 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                      categoryQuery === cat
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "glass border border-border/40 text-muted hover:bg-surface-dark hover:border-primary/30 hover:text-foreground"
                    }`}
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

          {/* Tentang Pengembang */}
          <DeveloperSection />
        </div>
      </div>
    </>
  );
}

function DeveloperSection() {
  const [isOpen, setIsOpen] = useState(false);
  const socials = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/yuliantoabuhanna",
      icon: "instagram",
    },
    {
      label: "WhatsApp",
      href: "https://wa.me/6281297007070?text=Assalamu%27alaikum%20kak%20Yulianto%2C%20saya%20ingin%20konsultasi%20tentang%20layanan%20YAIAPPS",
      icon: "whatsapp",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@yuvidotid",
      icon: "youtube",
    },
    {
      label: "LinkedIn",
      href: "https://id.linkedin.com/in/yuli-anto-abu-hanna-2129ab314",
      icon: "linkedin",
    },
  ];

  const socialIcon = (name: string, className: string) => {
    switch (name) {
      case "instagram":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case "whatsapp":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        );
      case "youtube":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] via-background to-accent/[0.04]"
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 sm:p-10 lg:p-14 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Tentang Pengembang</h3>
            <p className="text-sm text-muted">Yulianto Abu Hanna — Full-Stack Developer</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-10 h-10 rounded-xl glass border border-border/50 flex items-center justify-center group-hover:border-primary/30 transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-muted" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 sm:px-10 lg:px-14 pb-6 sm:pb-10 lg:pb-14">
              {/* Background glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Floating particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
                  style={{
                    left: `${15 + i * 20}%`,
                    top: `${10 + (i % 3) * 30}%`,
                  }}
                  animate={{
                    y: [-6, 6, -6],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />
              ))}

              <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
                {/* Photo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-shrink-0"
                >
                  <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden ring-4 ring-primary/10 shadow-xl shadow-primary/10 transition-all duration-500 group-hover:ring-primary/20 group-hover:shadow-primary/20">
                      <Image
                        src="https://fxqghtotzvapeynaqngg.supabase.co/storage/v1/object/sign/Buku%20Saya/Fotoku.JPG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YjY4OGEzNS05NzkwLTRiNDktYmRkNC1lYTNiYjFlNmM0YWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJCdWt1IFNheWEvRm90b2t1LkpQRyIsImlhdCI6MTc3OTE5OTAyNywiZXhwIjoxODEwNzM1MDI3fQ.6SqxiP2aSqq8T03UVS5j9Bo63kqeXPu1pGfSZzbY9C4"
                        alt="Yulianto Abu Hanna"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                    </div>
                    <div className="absolute -inset-4 bg-primary/10 rounded-[32px] blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left space-y-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-2">
                      Tentang Pengembang
                    </p>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                      Yulianto <span className="text-primary">Abu Hanna</span>
                    </h3>
                    <p className="text-sm sm:text-base text-muted mt-1.5 font-medium">
                      Full-Stack Developer &amp; Founder YAIAPPS
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-sm sm:text-base text-muted leading-relaxed max-w-xl mx-auto lg:mx-0"
                  >
                    Membangun solusi website untuk dakwah, pendidikan, dan berbagai kebutuhan digital Indonesia.
                  </motion.p>

                  <motion.blockquote
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="border-l-2 border-primary/30 pl-4 py-2 text-sm sm:text-base text-foreground/80 italic leading-relaxed mx-auto lg:mx-0 max-w-md"
                  >
                    &ldquo;Membangun teknologi yang bermanfaat untuk dakwah dan umat.&rdquo;
                  </motion.blockquote>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex items-center justify-center lg:justify-start gap-3 pt-2"
                  >
                    {socials.map((s) => (
                      <Link
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center w-11 h-11 rounded-xl glass border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
                        aria-label={s.label}
                      >
                        {socialIcon(s.icon, "w-5 h-5 text-muted group-hover:text-primary transition-colors duration-300")}
                      </Link>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

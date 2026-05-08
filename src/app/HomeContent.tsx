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
import { TrendingUp, ChevronLeft, ChevronRight, Layers, BookOpen, ChevronDown, Users, Gift, BadgeDollarSign } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {title}
        </h2>
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-white border border-border/50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
        >
          {children}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-white border border-border/50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function HadithQuote() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative py-16 sm:py-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6 text-accent" />
        </div>
        <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground leading-relaxed italic">
          &ldquo;Barangsiapa menempuh jalan untuk mencari ilmu,
          maka Allah akan mudahkan baginya jalan menuju surga.&rdquo;
        </blockquote>
        <div className="w-16 h-px bg-accent/40 mx-auto" />
        <p className="text-sm text-muted">
          HR. Muslim
        </p>
      </div>
    </motion.div>
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    setDropdownOpen(false);
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

  const trendingBooks = books.slice(0, 8);
  const newBooks = [...books].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const newestIds = new Set(newBooks.slice(0, 5).map((b) => b.id));
  const freeBooks = newBooks.filter((b) => !b.is_paid);
  const paidBooks = newBooks.filter((b) => b.is_paid);

  if (searchQuery || categoryQuery) {
    return (
      <div className="pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted">
            Telah dikunjungi <span className="font-semibold text-foreground">{visitorCount.toLocaleString("id-ID")}</span> pengunjung
          </span>
        </motion.div>
      </div>

      <div id="books" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <SectionSkeleton />
            ) : (
              <ScrollContainer title="Trending Books" icon={TrendingUp}>
                {trendingBooks.map((book, i) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    index={i}
                    isNew={newestIds.has(book.id)}
                  />
                ))}
              </ScrollContainer>
            )}
          </motion.div>

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
                  />
                ))}
              </ScrollContainer>
            ) : null}
          </motion.div>

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
                  />
                ))}
              </ScrollContainer>
            ) : null}
          </motion.div>

          <HadithQuote />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Jelajahi Kategori
                  </h2>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/30 transition-colors duration-200 min-w-[160px] justify-between"
                  >
                    <span className="truncate">
                      {categoryQuery || "Semua Kategori"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 z-20 glass rounded-2xl shadow-lg min-w-[200px] max-h-64 overflow-y-auto py-1">
                        <button
                          onClick={() => handleCategorySelect("")}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-dark transition-colors ${!categoryQuery ? "text-primary font-medium" : "text-muted"}`}
                        >
                          Semua Kategori
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface-dark transition-colors ${categoryQuery === cat ? "text-primary font-medium" : "text-muted"}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={`/?category=${encodeURIComponent(cat)}`}
                    className={`glass flex items-center gap-2.5 p-3 sm:p-4 rounded-2xl transition-all duration-300 group ${
                      categoryQuery === cat
                        ? "!bg-primary/10 !border-primary/30 shadow-sm"
                        : "hover:!border-primary/30 hover:shadow-md hover:shadow-primary/5"
                    }`}
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${
                      categoryQuery === cat
                        ? "bg-primary/20"
                        : "bg-primary/10 group-hover:bg-primary/20"
                    }`}>
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className={`text-xs sm:text-sm font-medium truncate ${
                      categoryQuery === cat ? "text-primary" : "text-foreground"
                    }`}>
                      {cat}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

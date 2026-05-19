"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowDown, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/lib/types";
import IslamicPattern from "./IslamicPattern";

function FloatingBook({ book, index, total }: { book: Book; index: number; total: number }) {
  const angle = (index / total) * 360;
  const radius = 120 + (index % 3) * 30;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius * 0.6;
  const delay = index * 0.3;
  const floatDuration = 4 + (index % 3) * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y: [y - 8, y + 8, y - 8],
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        x: { duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] },
        y: { duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 },
      }}
      className="absolute"
      style={{ left: "50%", top: "50%", marginLeft: -32, marginTop: -44 }}
    >
      <Link href={`/book/${book.id}`}>
        <motion.div
          whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0], transition: { duration: 0.4 } }}
          className="relative w-16 h-22 sm:w-20 sm:h-28 rounded-lg overflow-hidden shadow-lg cursor-pointer"
          style={{
            rotate: `${(index % 5) * 6 - 12}deg`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

function FloatingBooks({ books }: { books: Book[] }) {
  const displayBooks = books.slice(0, 8);
  return (
    <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[380px]">
      <motion.div
        animate={{ rotate: [0, 3, 0, -3, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {displayBooks.map((book, i) => (
          <FloatingBook key={book.id} book={book} index={i} total={displayBooks.length} />
        ))}
      </motion.div>
    </div>
  );
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        setBooks(data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 pb-16 sm:pb-20 lg:pb-24">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-[0.35]">
        <IslamicPattern />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Text */}
          <div className="relative z-10 text-left space-y-6 sm:space-y-8">
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/8 border border-primary/10 rounded-full text-xs text-primary font-medium">
                <Star className="w-3.5 h-3.5 fill-current" />
                Perpustakaan Digital Islami
              </div>
            </FadeUp>

            <div className="space-y-4">
              <FadeUp delay={0.2}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight text-balance">
                  Temani hatimu dengan{" "}
                  <span className="text-primary relative">
                    membaca
                    <span className="absolute -bottom-1 left-0 right-0 h-2 bg-primary/15 rounded-full -rotate-1" />
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.35}>
                <p className="text-base sm:text-lg text-muted leading-relaxed max-w-lg text-balance">
                  Karena tidak semua yang kita lihat mendekatkan kita kepada Allah.
                  Jelajahi ribuan buku islami pilihan.
                </p>
              </FadeUp>
            </div>

            <FadeUp delay={0.5}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <Link
                  href="#books"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] text-sm"
                >
                  <BookOpen className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                  Mulai Membaca
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="#trending"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 glass text-foreground font-medium rounded-2xl hover:bg-surface-dark transition-all duration-300 text-sm border border-border/60"
                >
                  Jelajahi Koleksi
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.65}>
              <div className="flex items-center gap-4 sm:gap-6 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/30 to-accent/30"
                    />
                  ))}
                </div>
                <div className="text-sm text-muted">
                  <span className="font-semibold text-foreground">{books.length}+</span> buku tersedia
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Right: Floating Books */}
          <FadeUp delay={0.4}>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10 pointer-events-none" />
              {loaded && <FloatingBooks books={books} />}
            </div>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center mt-12 sm:mt-16"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] text-muted/50 uppercase tracking-widest font-medium">Scroll</span>
            <ArrowDown className="w-3.5 h-3.5 text-muted/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

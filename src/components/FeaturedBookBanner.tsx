"use client";

import { Book } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  BookOpen,
  Clock,
  Eye,
  ShoppingCart,
  Download,
  ArrowRight,
  Gem,
} from "lucide-react";

interface FeaturedBookBannerProps {
  book: Book;
}

export default function FeaturedBookBanner({ book }: FeaturedBookBannerProps) {
  const isUpcoming =
    book.status === "scheduled" &&
    !!book.scheduled_at &&
    new Date(book.scheduled_at) > new Date();

  const hasPromo =
    book.is_paid &&
    (book.promo_price || 0) > 0 &&
    (book.promo_price || 0) < (book.price || 25000);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.14] via-transparent to-primary/[0.10]"
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-primary/40" />

      <div className="relative grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-center p-6 sm:p-10 lg:p-14">
        {/* Cover */}
        <div className="relative mx-auto lg:mx-0 w-48 sm:w-56 lg:w-full max-w-[280px]">
          <div className="absolute inset-4 bg-amber-500/30 blur-2xl rounded-full" />
          <motion.div
            initial={{ rotate: -4, scale: 0.92 }}
            whileInView={{ rotate: -3, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <Link href={`/book/${book.id}`} className="block">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/20 ring-1 ring-white/10">
                {book.cover_url ? (
                  <Image
                    src={book.cover_url}
                    alt={book.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 30vw, 280px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500/30 to-primary/20 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/40">
                      {book.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Info */}
        <div className="text-center lg:text-left space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/25">
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              Buku Unggulan
            </span>
            {isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-500/25">
                <Clock className="w-3.5 h-3.5" />
                Segera Launching{" "}
                {new Date(book.scheduled_at!).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                <BookOpen className="w-3.5 h-3.5" />
                {book.category}
              </span>
            )}
            {book.is_paid && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-xs font-semibold rounded-full">
                <Gem className="w-3.5 h-3.5" />
                Premium
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight text-balance">
            <Link href={`/book/${book.id}`} className="hover:text-primary transition-colors">
              {book.title}
            </Link>
          </h2>

          {(book.author || book.translator) && (
            <p className="text-sm text-muted">
              {book.author && (
                <span>
                  Penulis:{" "}
                  <span className="font-medium text-foreground/80">
                    {book.author}
                  </span>
                </span>
              )}
              {book.author && book.translator && " · "}
              {book.translator && (
                <span>
                  Penerjemah:{" "}
                  <span className="font-medium text-foreground/80">
                    {book.translator}
                  </span>
                </span>
              )}
            </p>
          )}

          {book.description && (
            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl mx-auto lg:mx-0 line-clamp-3">
              {book.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 pt-1">
            {book.views > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <Eye className="w-4 h-4 text-primary/70" />
                {formatNumber(book.views)} dibaca
              </span>
            )}
            {book.is_paid && book.purchased > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <ShoppingCart className="w-4 h-4 text-primary/70" />
                {formatNumber(book.purchased)} dibeli
              </span>
            )}
            {book.downloads > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <Download className="w-4 h-4 text-primary/70" />
                {formatNumber(book.downloads)} unduhan
              </span>
            )}
            {book.page_count ? (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <BookOpen className="w-4 h-4 text-primary/70" />
                {formatNumber(book.page_count)} halaman
              </span>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <Link
              href={`/book/${book.id}`}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              {isUpcoming ? "Lihat Detail" : "Baca Sekarang"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            {book.is_paid && (
              <span className="text-sm">
                {hasPromo && book.promo_text ? (
                  <>
                    <span className="text-muted line-through mr-2">
                      Rp {(book.price || 25000).toLocaleString("id-ID")}
                    </span>
                    <span className="font-bold text-amber-500">
                      Rp {(book.promo_price || 0).toLocaleString("id-ID")}
                    </span>
                    <span className="ml-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {book.promo_text}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-foreground">
                    Rp {(book.price || 25000).toLocaleString("id-ID")}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

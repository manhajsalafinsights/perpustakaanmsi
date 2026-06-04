"use client";

import { Book } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Lock, ShoppingCart, MessageCircle, BookOpen } from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
  return String(n);
}

function getCommentCount(book: Book): number {
  if (!book.comment_count) return 0;
  if (typeof book.comment_count === "number") return book.comment_count;
  return book.comment_count.count || 0;
}

function getVolumeCount(book: Book): number {
  if (!book.volumes) return 0;
  if (Array.isArray(book.volumes)) {
    if (book.volumes.length > 0 && "count" in book.volumes[0]) {
      return (book.volumes[0] as unknown as { count: number }).count || 0;
    }
    return book.volumes.length;
  }
  return 0;
}

interface BookCardProps {
  book: Book;
  index?: number;
  onClick?: (book: Book) => void;
  isNew?: boolean;
  variant?: "scroll" | "grid";
}

export default function BookCard({ book, index = 0, onClick, isNew, variant = "grid" }: BookCardProps) {
  const showViews = book.views > 0;
  const showPurchased = book.is_paid && book.purchased > 0;
  const hasPromo = book.is_paid && (book.promo_price || 0) > 0 && (book.promo_price || 0) < (book.price || 25000);
  const commentCount = getCommentCount(book);
  const volumeCount = getVolumeCount(book);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group ${variant === "scroll" ? "flex-shrink-0 w-44 sm:w-52 snap-start" : "w-full"}`}
    >
      <Link href={`/book/${book.id}`} onClick={() => onClick?.(book)}>
        <div className="glass rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_-8px_rgba(52,211,153,0.12)] hover:-translate-y-1.5 cursor-pointer border border-glass-border group-hover:border-primary/20">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-dark">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                <span className="text-4xl font-bold text-primary/30">
                  {book.title.charAt(0)}
                </span>
              </div>
            )}
            {book.is_paid && (
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 bg-accent/90 text-white text-[10px] font-bold rounded-xl shadow-sm backdrop-blur-sm">
                <Lock className="w-3 h-3" />
                Rp {(hasPromo ? (book.promo_price || 0) : (book.price || 25000)).toLocaleString("id-ID")}
              </div>
            )}
            {hasPromo && book.promo_text && (
              <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-xl shadow-sm">
                {book.promo_text}
              </div>
            )}
            {!hasPromo && isNew && (
              <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-xl shadow-sm">
                NEW
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <span className="flex items-center gap-2 px-4 py-2 bg-foreground/10 text-white text-xs font-semibold rounded-xl shadow-lg backdrop-blur-sm border border-white/10">
                <Eye className="w-4 h-4" />
                Lihat Detail
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {book.description}
            </p>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {book.category}
              </span>
              {!book.is_paid && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Gratis
                </span>
              )}
              {volumeCount > 0 && (
                <span className="text-[10px] font-medium text-muted bg-surface-dark px-2 py-0.5 rounded-full">
                  {volumeCount} Jilid
                </span>
              )}
              {showViews && (
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatNumber(book.views)}
                </span>
              )}
              {showPurchased && (
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  {formatNumber(book.purchased)}
                </span>
              )}
              {commentCount > 0 && (
                <span className="text-[10px] text-muted flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {commentCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

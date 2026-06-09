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
}

export default function BookCard({ book, index = 0, onClick, isNew }: BookCardProps) {
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
      className="group w-full"
    >
      <Link href={`/book/${book.id}`} onClick={() => onClick?.(book)}>
        <div className="glass rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(59,130,246,0.18)] hover:-translate-y-1 cursor-pointer border border-glass-border group-hover:border-primary/40 h-full">
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
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-accent/90 text-white text-[10px] font-bold rounded-lg shadow-sm backdrop-blur-sm">
                <Lock className="w-2.5 h-2.5" />
                Rp {(hasPromo ? (book.promo_price || 0) : (book.price || 25000)).toLocaleString("id-ID")}
              </div>
            )}
            {hasPromo && book.promo_text && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-lg shadow-sm">
                {book.promo_text}
              </div>
            )}
            {!hasPromo && isNew && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-lg shadow-sm">
                NEW
              </div>
            )}
          </div>
          <div className="p-2 sm:p-3">
            <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 mb-0.5 group-hover:text-primary transition-colors leading-snug">
              {book.title}
            </h3>
            <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
              {book.description}
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                {book.category}
              </span>
              {!book.is_paid && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  Gratis
                </span>
              )}
              {volumeCount > 0 && (
                <span className="text-[10px] font-medium text-muted bg-surface-dark px-1.5 py-0.5 rounded-full">
                  {volumeCount} Jilid
                </span>
              )}
              {showViews && (
                <span className="text-[10px] text-muted flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" />
                  {formatNumber(book.views)}
                </span>
              )}
              {showPurchased && (
                <span className="text-[10px] text-muted flex items-center gap-0.5">
                  <ShoppingCart className="w-2.5 h-2.5" />
                  {formatNumber(book.purchased)}
                </span>
              )}
              {commentCount > 0 && (
                <span className="text-[10px] text-muted flex items-center gap-0.5">
                  <MessageCircle className="w-2.5 h-2.5" />
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

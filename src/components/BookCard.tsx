"use client";

import { Book } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Lock, ShoppingCart } from "lucide-react";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "jt";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "rb";
  return String(n);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group ${variant === "scroll" ? "flex-shrink-0 w-44 sm:w-52" : "w-full"}`}
    >
      <Link href={`/book/${book.id}`} onClick={() => onClick?.(book)}>
        <div className="glass rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-dark">
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
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
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-accent/90 text-white text-[10px] font-bold rounded-lg shadow-sm">
                <Lock className="w-3 h-3" />
                Berbayar
              </div>
            )}
            {isNew && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-lg shadow-sm">
                NEW
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-1.5 text-white/90 text-xs">
                <Eye className="w-3.5 h-3.5" />
                Lihat Detail
              </div>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
              {book.title}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {book.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {book.category}
              </span>
              {!book.is_paid && (
                <span className="text-[10px] font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Gratis
                </span>
              )}
            </div>
            {(showViews || showPurchased) && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50">
                {showViews && (
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <Eye className="w-3 h-3" />
                    <span>{formatNumber(book.views)} dibaca</span>
                  </div>
                )}
                {showPurchased && (
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <ShoppingCart className="w-3 h-3" />
                    <span>{formatNumber(book.purchased)} dibeli</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

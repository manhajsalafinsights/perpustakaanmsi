"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const NAMES = [
  "Ahmad", "Siti", "Muhammad", "Nurul", "Abdullah", "Fatimah",
  "Hasan", "Khadijah", "Umar", "Aisha", "Ali", "Maryam",
  "Bilal", "Ruqayyah", "Usman", "Hafshah", "Zainab", "Sa'ad",
  "Sumayyah", "Ummu Salamah", "Asma", "Khalid", "Abu Bakar",
  "Aisyah", "Ibrahim", "Yusuf", "Yahya", "Musa", "Zubair",
  "Husain",
];

export default function FloatingPurchaseNotification() {
  const [books, setBooks] = useState<string[]>([]);
  const [current, setCurrent] = useState<{ name: string; book: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBooks(data.map((b: { title: string }) => b.title).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (books.length === 0) return;

    const show = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const book = books[Math.floor(Math.random() * books.length)];
      setCurrent({ name, book });
      setVisible(true);
      setTimeout(() => setVisible(false), 8000);
    };

    const initial = setTimeout(show, 10000);
    const interval = setInterval(show, 45000 + Math.random() * 15000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [books]);

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed top-24 sm:bottom-8 sm:top-auto right-4 sm:right-8 z-[100] max-w-sm pointer-events-none"
        >
          <div className="glass rounded-2xl p-4 border border-accent/20 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium">
                  <span className="text-accent font-semibold">{current.name}</span> telah membeli
                </p>
                <p className="text-sm text-muted truncate mt-0.5">
                  &ldquo;{current.book}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

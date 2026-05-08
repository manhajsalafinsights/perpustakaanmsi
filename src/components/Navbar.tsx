"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User, Search } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="https://xkxmpmbqmcdtlufdqljz.supabase.co/storage/v1/object/sign/Pribadi/Manhaj%20Salaf%20Insign%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZWVjODVkMy04ZGM2LTRlNzMtOTU0Yy1iMTBmZDhkOTg0YjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcmliYWRpL01hbmhhaiBTYWxhZiBJbnNpZ24gbG9nby5wbmciLCJpYXQiOjE3Nzc5Njg2MjMsImV4cCI6MTkzNTY0ODYyM30.QOivqgZr4vyLdPS994pa7i5BaPhu-TfMXMP5QrJngDo"
              alt="Perpustakaan MSI"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <span className="text-lg font-bold text-foreground hidden sm:block">
              Perpustakaan<span className="text-primary">MSI</span>
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md mx-4 sm:mx-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Cari buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
              />
            </div>
          </form>

            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/profile"
                className="text-sm text-muted hover:text-foreground transition-colors duration-200"
              >
                Profil
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-2xl hover:bg-primary-dark transition-colors duration-300"
              >
                <User className="w-4 h-4" />
                Admin
              </Link>
            </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-xl hover:bg-surface-dark transition-colors duration-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="sm:hidden glass border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Cari buku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  />
                </div>
              </form>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm text-muted hover:text-primary rounded-xl hover:bg-surface-dark transition-all duration-200"
              >
                Profil
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm text-white bg-primary rounded-xl text-center font-medium"
              >
                Admin Panel
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, User, Search, Command } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    } else if (searchParams.get("search")) {
      router.push("/");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-glass-border shadow-sm"
          : "bg-gradient-to-b from-background/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="https://fxqghtotzvapeynaqngg.supabase.co/storage/v1/object/sign/Cover%20Buku/Manhaj%20Salaf%20Insign%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YjY4OGEzNS05NzkwLTRiNDktYmRkNC1lYTNiYjFlNmM0YWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3ZlciBCdWt1L01hbmhhaiBTYWxhZiBJbnNpZ24gbG9nby5wbmciLCJpYXQiOjE3NzgyODg2MzgsImV4cCI6MTgwOTgyNDYzOH0.M-EFUpq7vsiKyHBu3e4Y5rKI0XnKTV5IG-AyV-zEz6E"
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
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-colors group-focus-within:text-primary" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Cari buku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-surface-dark/80 border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-surface transition-all duration-300"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted/40 bg-surface border border-border rounded-md font-mono group-focus-within:hidden">
                <Command className="w-2.5 h-2.5" />
                /
              </kbd>
            </div>
          </form>

          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/profile"
              className="px-3 py-2 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-dark transition-all duration-200"
            >
              Profil
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-primary/10"
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
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border rounded-2xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
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

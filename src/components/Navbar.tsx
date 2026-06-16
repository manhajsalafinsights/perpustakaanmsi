"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, User, Search, Command, Home, BookOpen, LayoutGrid, Shield } from "lucide-react";
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
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      setShowSuggestions(false);
    } else if (searchParams.get("search")) {
      router.push("/");
    }
  };

  const isHome = pathname === "/";

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass border-b border-glass-border shadow-lg shadow-black/5"
            : "glass border-b border-glass-border/50 shadow-sm shadow-black/5"
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Mobile search */}
            <form
              onSubmit={handleSearch}
              className="flex-1 mx-2 sm:hidden"
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Cari buku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-8 pr-3 py-1.5 bg-surface/80 border border-border rounded-lg text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                />
                {showSuggestions && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl border border-border shadow-lg overflow-hidden z-50">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-dark transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-muted" />
                      Cari &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Desktop search */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-md mx-4 sm:mx-8 hidden sm:block"
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted transition-colors group-focus-within:text-primary" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Cari buku..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-12 py-2.5 bg-surface/80 border border-border rounded-2xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/60 focus:bg-surface-dark transition-all duration-300"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-muted/40 bg-surface border border-border rounded-md font-mono group-focus-within:hidden">
                  <Command className="w-2.5 h-2.5" />
                  /
                </kbd>
                {showSuggestions && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass rounded-2xl border border-border shadow-lg overflow-hidden z-50">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-surface-dark transition-colors"
                    >
                      <Search className="w-4 h-4 text-muted" />
                      Cari &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                )}
              </div>
            </form>

            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/rekomendasi"
                className="px-3 py-2 text-sm text-muted hover:text-foreground rounded-xl hover:bg-surface-dark transition-all duration-200"
              >
                Rekomendasi
              </Link>
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
                <Shield className="w-4 h-4" />
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
                <Link
                  href="/rekomendasi"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-muted hover:text-primary rounded-xl hover:bg-surface-dark transition-all duration-200"
                >
                  Rekomendasi
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-muted hover:text-primary rounded-xl hover:bg-surface-dark transition-all duration-200"
                >
                  Profil
                </Link>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-muted">Tema Gelap</span>
                  <ThemeToggle />
                </div>
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

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-glass-border pb-safe">
        <div className="flex items-center justify-around h-16 px-1">
          {[
            { href: "/", icon: Home, label: "Beranda" },
            { href: null, icon: Search, label: "Cari", isSearch: true },
            { href: "/rekomendasi", icon: BookOpen, label: "Rekomendasi" },
            { href: "/profile", icon: User, label: "Profil" },
            { href: "/admin", icon: Shield, label: "Admin", isAdmin: true },
          ].map((item) => {
            const active = item.href && pathname === item.href;
            if (item.isSearch) {
              return (
                <button
                  key="search"
                  onClick={() => {
                    const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Cari buku..."]');
                    if (searchInput) searchInput.focus();
                    else window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-muted hover:text-foreground transition-all duration-150 active:scale-90"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium">Cari</span>
                </button>
              );
            }
            const sharedLinkClass = `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 active:scale-90 ${
              active ? "text-primary" : "text-muted hover:text-foreground"
            }`;
            if (item.isAdmin) {
              return (
                <Link key="admin" href="/admin" className={sharedLinkClass}>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    active ? "bg-primary shadow-sm -translate-y-0.5" : ""
                  }`}>
                    <Shield className={`w-4 h-4 transition-all duration-200 ${active ? "scale-110 text-white" : "text-muted"}`} />
                  </div>
                  <span className="text-[10px] font-medium">Admin</span>
                </Link>
              );
            }
            return (
              <Link key={item.href} href={item.href!} className={sharedLinkClass}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  active ? "bg-primary/10 shadow-sm -translate-y-0.5" : ""
                }`}>
                  <item.icon className={`w-5 h-5 transition-all duration-200 ${active ? "scale-110" : ""}`} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

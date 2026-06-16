"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ChevronDown } from "lucide-react";

function FooterColumn({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b sm:border-none border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2.5 sm:cursor-default sm:py-0"
      >
        <h4 className="font-semibold text-foreground text-xs">{title}</h4>
        <ChevronDown className={`w-3.5 h-3.5 text-muted sm:hidden transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`${open ? "block" : "hidden"} sm:block pb-2 sm:pb-0`}>
        <div className="space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="hidden sm:block glass border-t border-border mt-8 sm:mt-12">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <Image
              src="https://fxqghtotzvapeynaqngg.supabase.co/storage/v1/object/sign/Cover%20Buku/Manhaj%20Salaf%20Insign%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YjY4OGEzNS05NzkwLTRiNDktYmRkNC1lYTNiYjFlNmM0YWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3ZlciBCdWt1L01hbmhhaiBTYWxhZiBJbnNpZ24gbG9nby5wbmciLCJpYXQiOjE3NzgyODg2MzgsImV4cCI6MTgwOTgyNDYzOH0.M-EFUpq7vsiKyHBu3e4Y5rKI0XnKTV5IG-AyV-zEz6E"
              alt="Perpustakaan MSI"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl"
              unoptimized
            />
            <span className="text-base sm:text-lg font-bold text-foreground">
              Perpustakaan<span className="text-primary">MSI</span>
            </span>
          </div>
          <p className="text-xs text-muted text-center sm:text-left leading-relaxed max-w-xs">
            Perpustakaan digital untuk menuntut ilmu agama dengan mudah.
          </p>
        </div>

        {/* Mobile: accordion */}
        <div className="sm:hidden">
          <FooterColumn title="Navigasi">
            <Link href="/" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Beranda</Link>
            <Link href="/#books" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Koleksi Buku</Link>
            <Link href="/profile" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Tentang Kami</Link>
          </FooterColumn>
          <FooterColumn title="Kategori">
            {["Aqidah", "Fiqih", "Hadits", "Akhlak"].map((cat) => (
              <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`} className="block text-xs text-muted hover:text-primary transition-colors duration-200">{cat}</Link>
            ))}
          </FooterColumn>
          <FooterColumn title="Akses">
            <Link href="/admin" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Admin Panel</Link>
          </FooterColumn>
          <FooterColumn title="Pengembang">
            <p className="text-xs text-muted">Yulianto Abu Hanna</p>
            <p className="text-xs text-muted">Full-Stack Developer</p>
            <Link href="https://www.instagram.com/yuliantoabuhanna" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Instagram</Link>
            <Link href="https://wa.me/6281297007070" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted hover:text-primary transition-colors duration-200">WhatsApp</Link>
          </FooterColumn>
        </div>

        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-xs">Navigasi</h4>
            <div className="space-y-1">
              <Link href="/" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Beranda</Link>
              <Link href="/#books" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Koleksi Buku</Link>
              <Link href="/profile" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Tentang Kami</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-xs">Kategori</h4>
            <div className="space-y-1">
              {["Aqidah", "Fiqih", "Hadits", "Akhlak"].map((cat) => (
                <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`} className="block text-xs text-muted hover:text-primary transition-colors duration-200">{cat}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-xs">Akses</h4>
            <div className="space-y-1">
              <Link href="/admin" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Admin Panel</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2 sm:mb-3 text-xs">Pengembang</h4>
            <div className="space-y-1">
              <p className="text-xs text-muted">Yulianto Abu Hanna</p>
              <p className="text-xs text-muted">Full-Stack Developer</p>
              <Link href="https://www.instagram.com/yuliantoabuhanna" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted hover:text-primary transition-colors duration-200">Instagram</Link>
              <Link href="https://wa.me/6281297007070" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted hover:text-primary transition-colors duration-200">WhatsApp</Link>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border text-center">
          <p className="text-xs sm:text-sm text-muted italic leading-relaxed max-w-md mx-auto">
            &ldquo;Semoga setiap huruf yang dibaca,
            menjadi cahaya di akhirat.&rdquo;
          </p>
          <p className="text-xs text-muted/60 mt-3 sm:mt-4">
            &copy; {new Date().getFullYear()} PerpustakaanMSI. Dibuat dengan{" "}
            <Heart className="w-3 h-3 inline text-primary" /> untuk umat.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2.5 mb-3">
            <Image
              src="https://xkxmpmbqmcdtlufdqljz.supabase.co/storage/v1/object/sign/Pribadi/Manhaj%20Salaf%20Insign%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZWVjODVkMy04ZGM2LTRlNzMtOTU0Yy1iMTBmZDhkOTg0YjYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJQcmliYWRpL01hbmhhaiBTYWxhZiBJbnNpZ24gbG9nby5wbmciLCJpYXQiOjE3Nzc5Njg2MjMsImV4cCI6MTkzNTY0ODYyM30.QOivqgZr4vyLdPS994pa7i5BaPhu-TfMXMP5QrJngDo"
              alt="Perpustakaan MSI"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl"
              unoptimized
            />
            <span className="text-lg font-bold text-foreground">
              Perpustakaan<span className="text-primary">MSI</span>
            </span>
          </Link>
          <p className="text-xs text-muted text-center leading-relaxed max-w-xs">
            Perpustakaan digital untuk menuntut ilmu agama dengan mudah.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs">Navigasi</h4>
            <div className="space-y-1.5">
              <Link href="/" className="block text-xs text-muted hover:text-primary transition-colors duration-200">
                Beranda
              </Link>
              <Link href="/#books" className="block text-xs text-muted hover:text-primary transition-colors duration-200">
                Koleksi Buku
              </Link>
              <Link href="/profile" className="block text-xs text-muted hover:text-primary transition-colors duration-200">
                Tentang Kami
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs">Kategori</h4>
            <div className="space-y-1.5">
              {["Aqidah", "Fiqih", "Hadits", "Akhlak"].map((cat) => (
                <Link
                  key={cat}
                  href={`/?category=${encodeURIComponent(cat)}`}
                  className="block text-xs text-muted hover:text-primary transition-colors duration-200"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs">Akses</h4>
            <div className="space-y-1.5">
              <Link href="/admin" className="block text-xs text-muted hover:text-primary transition-colors duration-200">
                Admin Panel
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted italic leading-relaxed max-w-md mx-auto">
            &ldquo;Semoga setiap huruf yang dibaca,
            menjadi cahaya di akhirat.&rdquo;
          </p>
          <p className="text-xs text-muted/60 mt-4">
            &copy; {new Date().getFullYear()} PerpustakaanMSI. Dibuat dengan{" "}
            <Heart className="w-3 h-3 inline text-primary" /> untuk umat.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BookNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">📕</p>
        <h1 className="text-xl font-bold text-foreground mb-2">
          Buku Tidak Ditemukan
        </h1>
        <p className="text-muted text-sm mb-6">
          Buku yang kamu cari tidak tersedia atau sudah dihapus.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

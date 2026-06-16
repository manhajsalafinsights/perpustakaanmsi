import { BookOpen, ExternalLink } from "lucide-react";
import RecommendationForm from "@/components/RecommendationForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RekomendasiPage() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-4 sm:mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Beranda
        </Link>

        <div className="glass rounded-3xl p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Rekomendasi Ebook
              </h1>
              <p className="text-sm text-muted">
                Ebook tidak tersedia? Rekomendasikan di sini
              </p>
            </div>
          </div>

          <div className="text-xs text-muted bg-surface-dark rounded-2xl p-4 mb-4 sm:mb-6 border border-border/50 leading-relaxed">
            <p className="font-medium text-foreground mb-1">Ketentuan:</p>
            <ul className="list-disc list-inside space-y-0.5 opacity-80">
              <li>Pastikan ebook yang direkomendasikan bermanhaj salaf</li>
              <li>Link Google Drive harus bisa diakses publik</li>
              <li>Tim kami akan mereview dan menyetujui dalam 1x24 jam</li>
              <li>Jika disetujui, ebook akan langsung online di perpustakaan</li>
            </ul>
          </div>

          <RecommendationForm />
        </div>

        <div className="text-center mt-4 sm:mt-6">
          <Link
            href="/"
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

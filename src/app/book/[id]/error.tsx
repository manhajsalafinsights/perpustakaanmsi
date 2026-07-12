"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function BookDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BookDetail] Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">
          Gagal Memuat Buku
        </h1>
        <p className="text-muted text-sm mb-2">
          Terjadi kesalahan saat memuat detail buku ini.
        </p>
        {error.message && (
          <details className="mb-4">
            <summary className="text-xs text-muted cursor-pointer hover:text-foreground transition-colors">
              Detail error
            </summary>
            <pre className="mt-2 text-[11px] text-red-400 bg-surface-dark rounded-xl p-3 overflow-auto text-left">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-dark text-foreground text-sm font-medium rounded-xl hover:bg-border transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}

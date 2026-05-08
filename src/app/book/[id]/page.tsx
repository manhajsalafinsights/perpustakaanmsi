import type { Metadata } from "next";
import BookDetailClient from "./BookDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/books?id=${id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const book = await res.json();
      return {
        title: `${book.title} - Perpustakaan MSI`,
        description: book.description?.slice(0, 160) || `Baca dan download ${book.title} gratis di Perpustakaan MSI.`,
        openGraph: {
          title: book.title,
          description: book.description?.slice(0, 160) || "",
          images: book.cover_url ? [{ url: book.cover_url }] : [],
          type: "book",
        },
      };
    }
  } catch {
    // ignore
  }
  return {
    title: "Detail Buku - Perpustakaan MSI",
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetailClient id={id} />;
}

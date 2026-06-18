import type { Metadata } from "next";
import { headers } from "next/headers";
import BookDetailClient from "./BookDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "perpustakaanmsi.vercel.app";
    const protocol = h.get("x-forwarded-proto") || "https";
    const siteUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `${protocol}://${host}`;
    const res = await fetch(`${siteUrl}/api/books?id=${id}`, {
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
          images: book.cover_url
            ? [{ url: `${siteUrl}/api/og-image?url=${encodeURIComponent(book.cover_url)}` }]
            : [],
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

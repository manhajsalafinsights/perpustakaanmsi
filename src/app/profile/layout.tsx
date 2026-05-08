import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Pengembang - Perpustakaan Digital",
  description: "Profil pengembang Perpustakaan Digital MSI",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pt-20">{children}</div>;
}

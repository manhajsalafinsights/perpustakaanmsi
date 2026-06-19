import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const FloatingPurchaseNotification = dynamic(() => import("@/components/FloatingPurchaseNotification"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = 'https://pustaka.manhajsalafinsights.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Perpustakaan MSI - Perpustakaan Digital Islami",
    template: "%s - Perpustakaan MSI",
  },
  description: "Temani hatimu dengan membaca. Perpustakaan digital islami untuk menuntut ilmu agama dengan mudah.",
  keywords: ["perpustakaan", "digital", "islami", "buku", "baca online", "ilmu agama", "ebook islam", "koleksi buku islam"],
  authors: [{ name: "Manhaj Salaf Insights" }],
  creator: "Manhaj Salaf Insights",
  publisher: "Manhaj Salaf Insights",
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
  verification: {
    google: "",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "Perpustakaan MSI",
    title: "Perpustakaan MSI - Perpustakaan Digital Islami",
    description: "Temani hatimu dengan membaca. Perpustakaan digital islami untuk menuntut ilmu agama dengan mudah.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perpustakaan MSI - Perpustakaan Digital Islami",
    description: "Temani hatimu dengan membaca. Perpustakaan digital islami untuk menuntut ilmu agama dengan mudah.",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "color-scheme": "light dark",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Flash prevention: apply dark class before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)t='dark';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
        {/* Background overlay (fixed, z-0) */}
        <div className="bg-overlay" />
        {/* Content (relative, z-10) */}
        <div className="relative z-10">
          <ThemeProvider>
            <div className="min-h-screen flex flex-col text-foreground transition-colors duration-300">
              <Suspense>
                <Navbar />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <Suspense fallback={null}>
                <FloatingPurchaseNotification />
              </Suspense>
            </div>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

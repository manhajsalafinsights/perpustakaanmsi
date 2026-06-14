import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingPurchaseNotification from "@/components/FloatingPurchaseNotification";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Perpustakaan MSI - Perpustakaan Digital Islami",
  description: "Temani hatimu dengan membaca. Perpustakaan digital islami untuk menuntut ilmu agama dengan mudah.",
  keywords: "perpustakaan, digital, islami, buku, baca online, ilmu agama",
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
              <FloatingPurchaseNotification />
            </div>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}

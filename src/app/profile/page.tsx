"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Code2,
  MapPin,
  BookOpen,
  Sparkles,
  Heart,
  MessageCircle,
  Phone,
  Tv,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="space-y-4">
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden shadow-2xl shadow-primary/20 ring-4 ring-primary/20">
              <Image
                src="https://fxqghtotzvapeynaqngg.supabase.co/storage/v1/object/sign/Cover%20Buku/Fotoku.JPG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81YjY4OGEzNS05NzkwLTRiNDktYmRkNC1lYTNiYjFlNmM0YWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDb3ZlciBCdWt1L0ZvdG9rdS5KUEciLCJpYXQiOjE3NzgyNDg1MDAsImV4cCI6MTkzNTkyODUwMH0.8xuk8HUjxQECMkn9IJQibWGF5BtqIAx_zZL7zdl8JSw"
                alt="Yulianto Abu Hanna"
                width={144}
                height={144}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Yulianto Abu Hanna
              </h1>
              <p className="text-lg text-muted mt-2">
                Full-Stack Developer & Founder YAIAPPS
              </p>
            </div>
          </div>

          <p className="text-muted max-w-2xl mx-auto leading-relaxed">
            Membangun solusi website untuk dakwah, pendidikan, dan berbagai
            kebutuhan digital Indonesia.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
              <MapPin className="w-4 h-4" />
              Indonesia
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 text-accent text-sm font-medium rounded-full">
              <BookOpen className="w-4 h-4" />
              Literasi Digital
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full">
              <Code2 className="w-4 h-4" />
              Next.js + Supabase
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 space-y-8"
        >
          <div className="glass rounded-3xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Tentang Proyek</h2>
            </div>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Perpustakaan Digital MSI adalah platform perpustakaan digital yang
                dirancang untuk memberikan akses mudah ke berbagai koleksi buku
                elektronik. Platform ini dibangun dengan teknologi modern untuk
                memberikan pengalaman membaca yang nyaman dan menyenangkan.
              </p>
              <p>
                Dengan antarmuka yang bersih dan modern, kami berkomitmen untuk
                membuat literasi lebih mudah diakses oleh semua orang, di mana
                saja dan kapan saja.
              </p>
            </div>
          </div>

          <div className="glass rounded-3xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Code2 className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Teknologi</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "Supabase",
                "PostgreSQL",
                "Framer Motion",
                "Lucide Icons",
              ].map((tech) => (
                <div
                  key={tech}
                  className="px-4 py-3 glass rounded-xl text-sm font-medium text-foreground text-center"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Kontak & Sosial Media</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://www.instagram.com/yuliantoabuhanna?igsh=dXZkbWl1cjhqdG00"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-pink-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-pink-500/15 rounded-xl flex items-center justify-center group-hover:bg-pink-500/25 transition-colors">
                  <InstagramIcon className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Instagram</p>
                  <p className="text-xs text-muted">@yuliantoabuhanna</p>
                </div>
              </a>
              <a
                href="https://wa.me/6281297007070"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-green-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center group-hover:bg-green-500/25 transition-colors">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">WhatsApp</p>
                  <p className="text-xs text-muted">081297007070</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@yuvidotid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-red-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center group-hover:bg-red-500/25 transition-colors">
                  <YoutubeIcon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">YouTube</p>
                  <p className="text-xs text-muted">@yuvidotid</p>
                </div>
              </a>
              <a
                href="https://id.linkedin.com/in/yuli-anto-abu-hanna-2129ab314"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 glass rounded-2xl hover:bg-blue-500/10 transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                  <LinkedinIcon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">LinkedIn</p>
                  <p className="text-xs text-muted">Yuli Anto Abu Hanna</p>
                </div>
              </a>
            </div>
          </div>

          <div className="text-center pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              <BookOpen className="w-5 h-5" />
              Kembali ke Perpustakaan
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function RevealText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          className="text-primary/60"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
      <div className="relative aspect-square">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full text-primary/[0.04]">
            <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 8" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 6" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8"
        >
          <svg viewBox="0 0 400 400" className="w-full h-full text-accent/[0.06]">
            <polygon points="200,20 380,300 20,300" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <polygon points="200,380 20,100 380,100" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 240 240" className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 text-primary" fill="none">
                <defs>
                  <linearGradient id="book-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                <rect x="40" y="50" width="160" height="150" rx="6" fill="url(#book-gradient)" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />

                <path d="M120 50 L120 200" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.15" />

                <path d="M50 55 L115 65 L115 195 L50 185" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.02" />
                <path d="M190 55 L125 65 L125 195 L190 185" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.2" fill="currentColor" fillOpacity="0.02" />

                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.line
                    key={`left-${i}`}
                    x1="58" y1={78 + i * 20}
                    x2="110" y2={82 + i * 20}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeOpacity="0.08"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 + i * 0.15 }}
                  />
                ))}
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.line
                    key={`right-${i}`}
                    x1="130" y1={82 + i * 20}
                    x2="182" y2={78 + i * 20}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeOpacity="0.08"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 1.2 + i * 0.15 }}
                  />
                ))}

                <motion.path
                  d="M60 70 Q85 60 110 65"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeOpacity="0.12"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 2.2 }}
                />
                <motion.path
                  d="M180 70 Q155 60 130 65"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeOpacity="0.12"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 2.2 }}
                />

                <motion.circle
                  cx="120"
                  cy="30"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  strokeOpacity="0.15"
                  fill="currentColor"
                  fillOpacity="0.03"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.path
                  d="M120 20 L124 28 L132 28 L126 33 L128 41 L120 36 L112 41 L114 33 L108 28 L116 28 Z"
                  fill="currentColor"
                  fillOpacity="0.12"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 2.5, type: "spring" }}
                />

                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (i * 60 - 90) * (Math.PI / 180);
                  const cx = 120 + Math.cos(angle) * 110;
                  const cy = 125 + Math.sin(angle) * 110;
                  return (
                    <motion.circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="2"
                      fill="currentColor"
                      fillOpacity="0.08"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 2.8 + i * 0.1 }}
                    />
                  );
                })}
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [-3, 3, -3], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 right-8"
        >
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary/30" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [3, -3, 3], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-8 left-4"
        >
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent/40" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-24">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-16 right-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="text-left space-y-8 sm:space-y-10 relative z-10">
            <FadeUp delay={0}>
              <p className="text-primary/60 text-xs sm:text-sm tracking-[0.25em] uppercase font-medium">
                Bismillahirrahmanirrahim
              </p>
            </FadeUp>

            <div className="space-y-5">
              <FadeUp delay={0.2}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight">
                  <RevealText text="Temani hatimu" delay={0.4} />
                  <br />
                  <span className="text-primary">
                    <RevealText text="dengan membaca" delay={1.1} />
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.8}>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                  className="text-base sm:text-lg text-muted leading-relaxed"
                >
                  Karena tidak semua yang kita lihat,
                  <br className="hidden sm:block" />{" "}
                  mendekatkan kita kepada Allah.
                </motion.p>
              </FadeUp>
            </div>

            <FadeUp delay={1.2}>
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 2.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link
                  href="#books"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-white font-medium rounded-2xl hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.03] text-sm sm:text-base"
                >
                  <BookOpen className="w-5 h-5" />
                  Mulai Membaca
                </Link>
              </motion.div>
            </FadeUp>
          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 -z-0 pointer-events-none">
            <div className="relative w-48 sm:w-64 lg:w-80 opacity-40 sm:opacity-60">
              <HeroIllustration />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-16 flex justify-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-border" />
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary/25" fill="currentColor">
                <path d="M12 2L13.09 8.26L20 9L15.55 13.97L16.91 21L12 17.27L7.09 21L8.45 13.97L4 9L10.91 8.26L12 2Z" />
              </svg>
            </motion.div>
            <div className="w-10 h-px bg-gradient-to-l from-transparent to-border" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

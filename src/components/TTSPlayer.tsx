"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Loader2,
} from "lucide-react";
import { extractPDFText, chunkText, speakChunk, stopSpeech, TTSChunk } from "@/lib/tts";

interface TTSPlayerProps {
  pdfUrl: string;
  pageLimit?: number;
  onClose: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function TTSPlayer({ pdfUrl, pageLimit, onClose }: TTSPlayerProps) {
  const [status, setStatus] = useState<"extracting" | "ready" | "playing" | "paused" | "done">("extracting");
  const [chunks, setChunks] = useState<TTSChunk[]>([]);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [extractProgress, setExtractProgress] = useState("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunkIndexRef = useRef(0);

  useEffect(() => {
    chunkIndexRef.current = chunkIndex;
  }, [chunkIndex]);

  useEffect(() => {
    let cancelled = false;
    setExtractProgress("Mengunduh PDF...");
    extractPDFText(pdfUrl, pageLimit).then((text) => {
      if (cancelled) return;
      if (!text.trim()) {
        setExtractProgress("Gagal mengekstrak teks dari PDF ini");
        return;
      }
      setExtractProgress("Memproses teks...");
      const c = chunkText(text);
      if (c.length === 0) {
        setExtractProgress("Tidak ada teks yang bisa dibacakan");
        return;
      }
      setChunks(c);
      setStatus("ready");
    });
    return () => { cancelled = true; stopSpeech(); };
  }, [pdfUrl, pageLimit]);

  const speakCurrent = useCallback((idx: number) => {
    if (idx >= chunks.length) {
      setStatus("done");
      return;
    }
    setChunkIndex(idx);
    setStatus("playing");
    const utt = speakChunk(
      chunks[idx],
      () => {
        if (chunkIndexRef.current < chunks.length - 1) {
          speakCurrent(chunkIndexRef.current + 1);
        } else {
          setStatus("done");
        }
      },
      () => setStatus("done"),
      speed,
    );
    utteranceRef.current = utt;
  }, [chunks, speed]);

  const handlePlay = () => {
    if (status === "ready" || status === "done") {
      speakCurrent(status === "done" ? 0 : chunkIndex);
    } else if (status === "paused") {
      setStatus("playing");
      speechSynthesis.resume();
    }
  };

  const handlePause = () => {
    setStatus("paused");
    speechSynthesis.pause();
  };

  const handleStop = () => {
    stopSpeech();
    setStatus("ready");
    setChunkIndex(0);
  };

  const handleSkipBack = () => {
    stopSpeech();
    const next = Math.max(0, chunkIndex - 1);
    if (status === "playing" || status === "paused") {
      speakCurrent(next);
    } else {
      setChunkIndex(next);
    }
  };

  const handleSkipForward = () => {
    stopSpeech();
    const next = Math.min(chunks.length - 1, chunkIndex + 1);
    if (status === "playing" || status === "paused") {
      speakCurrent(next);
    } else {
      setChunkIndex(next);
    }
  };

  const handleSpeedChange = () => {
    const idx = SPEEDS.indexOf(speed);
    const nextSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(nextSpeed);
    if (status === "playing") {
      stopSpeech();
      speakCurrent(chunkIndex);
    }
  };

  const progress = chunks.length > 0 ? ((chunkIndex + 1) / chunks.length) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl"
      >
        {status === "extracting" ? (
          <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            {extractProgress}
          </div>
        ) : chunks.length === 0 ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-muted">{extractProgress}</span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="h-0.5 bg-surface-dark">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
              {/* Close */}
              <button
                onClick={() => { stopSpeech(); onClose(); }}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Skip Back */}
              <button
                onClick={handleSkipBack}
                disabled={chunkIndex === 0}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={status === "playing" ? handlePause : handlePlay}
                className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                {status === "playing" ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              {/* Skip Forward */}
              <button
                onClick={handleSkipForward}
                disabled={chunkIndex >= chunks.length - 1}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Speed */}
              <button
                onClick={handleSpeedChange}
                className="px-2 py-1 text-xs font-semibold rounded-lg bg-surface-dark text-muted hover:text-foreground transition-colors"
              >
                {speed}x
              </button>

              {/* Progress text */}
              <span className="hidden sm:block text-xs text-muted ml-auto">
                {chunkIndex + 1} / {chunks.length}
              </span>

              <Volume2 className="hidden sm:block w-3.5 h-3.5 text-muted" />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

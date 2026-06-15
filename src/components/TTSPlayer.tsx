"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Loader2,
  FileAudio,
  FileText,
  AlertCircle,
} from "lucide-react";
import { extractPDFText, chunkText, playChunk, stopSpeech, TTSChunk } from "@/lib/tts";

interface TTSPlayerProps {
  pdfUrl: string;
  pageLimit?: number;
  onClose: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function TTSPlayer({ pdfUrl, pageLimit, onClose }: TTSPlayerProps) {
  const [status, setStatus] = useState<string>("extracting");
  const [chunks, setChunks] = useState<TTSChunk[]>([]);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [msg, setMsg] = useState("");

  const idxRef = useRef(0);
  const chunksRef = useRef<TTSChunk[]>([]);
  const speedRef = useRef(1);

  idxRef.current = chunkIndex;
  chunksRef.current = chunks;
  speedRef.current = speed;

  useEffect(() => {
    if (!pdfUrl) { setMsg("Tidak ada file PDF"); return; }

    let cancelled = false;

    (async () => {
      try {
        setMsg("Mengunduh PDF...");
        const text = await extractPDFText(pdfUrl, pageLimit);
        if (cancelled) return;

        if (!text.trim()) {
          setMsg("Gagal mengekstrak teks dari PDF ini");
          return;
        }

        setMsg("Memproses teks...");
        const c = chunkText(text);
        if (cancelled) return;

        if (c.length === 0) {
          setMsg("Teks terlalu pendek untuk dibacakan");
          return;
        }

        setChunks(c);
        setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setMsg("Gagal: " + (e instanceof Error ? e.message : "Error"));
        }
      }
    })();

    return () => { cancelled = true; stopSpeech(); };
  }, [pdfUrl, pageLimit]);

  const speakNext = (idx: number) => {
    const c = chunksRef.current;
    if (idx >= c.length) { setStatus("done"); return; }
    setChunkIndex(idx);
    setStatus("playing");
    playChunk(
      c[idx].text,
      () => {
        const next = idxRef.current + 1;
        if (next < chunksRef.current.length) speakNext(next);
        else setStatus("done");
      },
      () => setStatus("done"),
      speedRef.current,
    );
  };

  const handlePlay = () => {
    if (status === "ready" || status === "done") {
      speakNext(status === "done" ? 0 : idxRef.current);
    } else if (status === "paused") {
      setStatus("playing");
      window.speechSynthesis?.resume();
    }
  };

  const handlePause = () => {
    setStatus("paused");
    window.speechSynthesis?.pause();
  };

  const handleStop = () => {
    stopSpeech();
    setStatus("ready");
    setChunkIndex(0);
  };

  const handlePrev = () => {
    stopSpeech();
    const next = Math.max(0, idxRef.current - 1);
    if (status === "playing" || status === "paused") speakNext(next);
    else setChunkIndex(next);
  };

  const handleNext = () => {
    stopSpeech();
    const next = Math.min(chunksRef.current.length - 1, idxRef.current + 1);
    if (status === "playing" || status === "paused") speakNext(next);
    else setChunkIndex(next);
  };

  const handleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const ns = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(ns);
    if (status === "playing") {
      stopSpeech();
      speakNext(idxRef.current);
    }
  };

  const pct = chunks.length > 0 ? ((chunkIndex + 1) / chunks.length) * 100 : 0;

  const isError = status === "extracting" && chunks.length === 0 && msg && !msg.startsWith("Mengunduh") && !msg.startsWith("Memproses");

  return (
    <>
      {/* Overlay loading */}
      {(status === "extracting" && chunks.length === 0 && !isError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-8 shadow-2xl border border-border flex flex-col items-center gap-4 max-w-xs w-full mx-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-foreground font-medium text-center">{msg}</p>
            <button onClick={onClose} className="text-xs text-muted hover:text-foreground underline">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-8 shadow-2xl border border-border flex flex-col items-center gap-4 max-w-xs w-full mx-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-foreground font-medium text-center">{msg}</p>
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Player bar */}
      {chunks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
          <div className="h-0.5 bg-surface-dark">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
            <button onClick={() => { stopSpeech(); onClose(); }} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors">
              <X className="w-4 h-4" />
            </button>

            <button onClick={handlePrev} disabled={chunkIndex === 0} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>

            <button onClick={status === "playing" ? handlePause : handlePlay} className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
              {status === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button onClick={handleNext} disabled={chunkIndex >= chunks.length - 1} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            <button onClick={handleStop} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors">
              <Square className="w-4 h-4" />
            </button>

            <button onClick={handleSpeed} className="px-2 py-1 text-xs font-semibold rounded-lg bg-surface-dark text-muted hover:text-foreground transition-colors">
              {speed}x
            </button>

            <span className="hidden sm:block text-xs text-muted ml-auto">
              {chunkIndex + 1} / {chunks.length}
            </span>
            <Volume2 className="hidden sm:block w-3.5 h-3.5 text-muted" />
          </div>
        </div>
      )}
    </>
  );
}

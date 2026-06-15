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
  AlertCircle,
} from "lucide-react";
import { extractPDFText, chunkText, playChunk, stopSpeech } from "@/lib/tts";

interface Props {
  pdfUrl: string;
  pageLimit?: number;
  onClose: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function TTSPlayer({ pdfUrl, pageLimit, onClose }: Props) {
  const [status, setStatus] = useState<string>("extracting");
  const [chunks, setChunks] = useState<{ index: number; text: string }[]>([]);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [msg, setMsg] = useState("Mengunduh PDF...");

  const idxRef = useRef(0);
  const chRef = useRef(chunks);
  const spRef = useRef(speed);
  idxRef.current = chunkIndex;
  chRef.current = chunks;
  spRef.current = speed;

  useEffect(() => {
    if (!pdfUrl) { setMsg("Tidak ada file PDF"); return; }
    let dead = false;

    (async () => {
      try {
        setMsg("Mengunduh PDF...");
        const text = await extractPDFText(pdfUrl, pageLimit);
        if (dead) return;
        if (!text.trim()) { setMsg("Tidak ada teks di PDF ini"); return; }

        setMsg("Memproses...");
        const c = chunkText(text);
        if (dead) return;
        if (c.length === 0) { setMsg("Teks terlalu pendek"); return; }

        setChunks(c);
        setStatus("ready");
      } catch (e: any) {
        if (!dead) setMsg("Gagal: " + (e?.message || "unknown"));
      }
    })();

    return () => { dead = true; stopSpeech(); };
  }, [pdfUrl, pageLimit]);

  function next(idx: number) {
    if (idx >= chRef.current.length) { setStatus("done"); return; }
    setChunkIndex(idx);
    setStatus("playing");
    playChunk(
      chRef.current[idx].text,
      () => { const n = idxRef.current + 1; if (n < chRef.current.length) next(n); else setStatus("done"); },
      () => setStatus("done"),
      spRef.current,
    );
  }

  const onPlay = () => {
    if (status === "ready" || status === "done") next(status === "done" ? 0 : idxRef.current);
    else if (status === "paused") { setStatus("playing"); speechSynthesis.resume(); }
  };

  const onPause = () => { setStatus("paused"); speechSynthesis.pause(); };
  const onStop = () => { stopSpeech(); setStatus("ready"); setChunkIndex(0); };

  const onPrev = () => {
    stopSpeech();
    const i = Math.max(0, idxRef.current - 1);
    if (status === "playing" || status === "paused") next(i); else setChunkIndex(i);
  };
  const onNext = () => {
    stopSpeech();
    const i = Math.min(chRef.current.length - 1, idxRef.current + 1);
    if (status === "playing" || status === "paused") next(i); else setChunkIndex(i);
  };
  const onSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(i + 1) % SPEEDS.length]);
    if (status === "playing") { stopSpeech(); next(idxRef.current); }
  };

  const hasChunks = chunks.length > 0;
  const pct = hasChunks ? ((chunkIndex + 1) / chunks.length) * 100 : 0;
  const isError = msg && !msg.startsWith("Mengunduh") && !msg.startsWith("Memproses") && !hasChunks;

  return (
    <>
      {!hasChunks && !isError && (
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

      {hasChunks && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-2xl">
          <div className="h-0.5 bg-surface-dark">
            <div className="h-full bg-primary transition-all" style={{ width: pct + "%" }} />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
            <button onClick={() => { stopSpeech(); onClose(); }} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors">
              <X className="w-4 h-4" />
            </button>
            <button onClick={onPrev} disabled={chunkIndex === 0} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={status === "playing" ? onPause : onPlay} className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
              {status === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={onNext} disabled={chunkIndex >= chunks.length - 1} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark disabled:opacity-30 transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={onStop} className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-dark transition-colors">
              <Square className="w-4 h-4" />
            </button>
            <button onClick={onSpeed} className="px-2 py-1 text-xs font-semibold rounded-lg bg-surface-dark text-muted hover:text-foreground transition-colors">
              {speed}x
            </button>
            <span className="hidden sm:block text-xs text-muted ml-auto">
              {chunkIndex + 1}/{chunks.length}
            </span>
            <Volume2 className="hidden sm:block w-3.5 h-3.5 text-muted" />
          </div>
        </div>
      )}
    </>
  );
}

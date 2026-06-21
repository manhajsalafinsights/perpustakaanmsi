"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  loading?: boolean;
}

export default function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmText = "Hapus", cancelText = "Batal",
  variant = "danger", loading = false,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[70] sm:w-full sm:max-w-sm glass rounded-3xl shadow-2xl p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 bg-surface-dark rounded-full flex items-center justify-center hover:bg-border transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-surface-dark text-foreground font-medium rounded-xl hover:bg-border transition-colors">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 text-white font-medium rounded-xl transition-colors disabled:opacity-50 ${
              variant === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </motion.div>
    </>
  );
}

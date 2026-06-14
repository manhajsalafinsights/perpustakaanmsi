"use client";

import { useState, useEffect, useCallback } from "react";
import { Book } from "@/lib/types";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Download, Tag, MessageCircle, Send, User } from "lucide-react";

interface Comment {
  id: string;
  book_id: string;
  name: string;
  message: string;
  created_at: string;
}

interface BookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookModal({ book, isOpen, onClose }: BookModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentMessage, setCommentMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"detail" | "comments">("detail");

  const fetchComments = useCallback(async (bookId: string) => {
    try {
      const res = await fetch(`/api/comments?book_id=${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen && book) {
      setActiveTab("detail");
      fetchComments(book.id);
      setCommentName("");
      setCommentMessage("");
    }
  }, [isOpen, book, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !commentName.trim() || !commentMessage.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          name: commentName.trim(),
          message: commentMessage.trim(),
        }),
      });

      if (res.ok) {
        setCommentName("");
        setCommentMessage("");
        fetchComments(book.id);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (!book) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-2xl sm:max-h-[85vh] glass rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface transition-colors shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-48 sm:h-60 bg-gradient-to-br from-primary/15 to-accent/10 flex-shrink-0">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary/20">
                    {book.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 -mt-10 relative">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {book.category}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {book.title}
              </h2>

              {(book.author || book.translator) && (
                <div className="text-sm text-muted mb-4 space-y-0.5">
                  {book.author && (
                    <div>
                      Penulis: <span className="font-medium text-foreground">{book.author}</span>
                    </div>
                  )}
                  {book.translator && (
                    <div>
                      Penerjemah: <span className="font-medium text-foreground">{book.translator}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-1 mb-6 border-b border-border">
                <button
                  onClick={() => setActiveTab("detail")}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                    activeTab === "detail"
                      ? "text-primary border-primary"
                      : "text-muted border-transparent hover:text-foreground"
                  }`}
                >
                  Detail
                </button>
                <button
                  onClick={() => setActiveTab("comments")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px ${
                    activeTab === "comments"
                      ? "text-primary border-primary"
                      : "text-muted border-transparent hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Komentar ({comments.length})
                </button>
              </div>

              {activeTab === "detail" ? (
                <div>
                  <p className="text-muted leading-relaxed mb-6">
                    {book.description || "Belum ada deskripsi untuk buku ini."}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {book.file_url && (
                      <a
                        href={book.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-dark transition-colors duration-300 shadow-md shadow-primary/15"
                      >
                        <BookOpen className="w-5 h-5" />
                        Baca Sekarang
                      </a>
                    )}
                    {book.file_url && (
                      <a
                        href={book.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-dark text-foreground font-semibold rounded-2xl hover:bg-border transition-colors duration-200"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleSubmitComment} className="space-y-3 mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama kamu"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-surface-dark border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis komentar..."
                        value={commentMessage}
                        onChange={(e) => setCommentMessage(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-surface-dark border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={submitting || !commentName.trim() || !commentMessage.trim()}
                        className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>

                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                      <p className="text-sm text-muted">Belum ada komentar</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 bg-surface-dark rounded-2xl border border-border/50"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {comment.name}
                            </span>
                            <span className="text-xs text-muted ml-auto">
                              {new Date(comment.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted pl-9 leading-relaxed">
                            {comment.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

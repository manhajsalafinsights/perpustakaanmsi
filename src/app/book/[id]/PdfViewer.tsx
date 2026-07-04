"use client";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect } from "react";

interface PdfViewerProps {
  file: string;
  currentPage: number;
  flipDir: number;
  flipAngle: number;
  isPaid: boolean;
  maxFreePages: number;
  numPages: number;
  onLoadSuccess: (result: { numPages: number }) => void;
  onLoadError: () => void;
}

export default function PdfViewer({
  file, currentPage, flipDir, flipAngle, isPaid, maxFreePages,
  numPages, onLoadSuccess, onLoadError,
}: PdfViewerProps) {
  // @ts-expect-error - worker entry has no type declarations
  useEffect(() => { import("react-pdf/dist/pdf.worker.entry"); }, []);

  const getPageWidth = () =>
    typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 900) : 800;

  const clampPage = (page: number) =>
    Math.max(1, Math.min(isPaid ? Math.min(numPages, maxFreePages) : numPages, page));

  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      loading={null}
    >
      <div className="relative flex justify-center px-4" style={{ perspective: "2000px" }}>
        {flipDir !== 0 && (
          <div className="absolute inset-0 flex justify-center">
            <div style={{ boxShadow: "inset 4px 0 12px rgba(0,0,0,0.12)" }}>
              <Page
                pageNumber={clampPage(currentPage + flipDir)}
                width={getPageWidth()}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </div>
          </div>
        )}
        <div style={{
          transform: `perspective(2000px) rotateY(${flipAngle}deg) translateX(${flipAngle / 4}px)`,
          transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          transformOrigin: flipDir > 0 ? "left" : "right",
          backfaceVisibility: "hidden",
          boxShadow: `${flipDir > 0 ? -flipAngle : flipAngle}px 4px 20px rgba(0,0,0,0.18)`,
        }}>
          <Page
            pageNumber={isPaid ? Math.min(currentPage, maxFreePages) : currentPage}
            width={getPageWidth()}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      </div>
    </Document>
  );
}

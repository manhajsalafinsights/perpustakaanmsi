"use client";

import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="h-48 skeleton-shimmer rounded-3xl" />
            <div className="space-y-6">
              <div className="h-7 skeleton-shimmer rounded-lg w-48" />
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 w-44">
                    <div className="aspect-[3/4] skeleton-shimmer rounded-2xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

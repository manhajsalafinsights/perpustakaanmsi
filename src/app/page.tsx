"use client";

import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 pb-12 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="h-24 skeleton-shimmer rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] skeleton-shimmer rounded-xl" />
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3 skeleton-shimmer rounded-lg w-3/4" />
                    <div className="h-2.5 skeleton-shimmer rounded-lg w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

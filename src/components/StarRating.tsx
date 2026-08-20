"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  size = 14,
  className = "",
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const interactive = !!onChange;

  return (
    <div
      className={`flex items-center gap-0.5 ${interactive ? "cursor-pointer" : ""} ${className}`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          aria-label={`${i} bintang`}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          className={interactive ? "transition-transform hover:scale-125 disabled:opacity-100" : "pointer-events-none"}
        >
          <Star
            className={i <= active ? "text-amber-400 fill-amber-400" : "text-muted/30"}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  );
}
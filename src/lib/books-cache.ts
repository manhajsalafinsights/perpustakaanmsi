import { Book } from "./types";

let cache: Promise<Book[]> | null = null;

export function fetchBooks(params?: URLSearchParams): Promise<Book[]> {
  const url = `/api/books${params ? `?${params.toString()}` : ""}`;

  if (!params) {
    if (!cache) {
      cache = fetch(url)
        .then((r) => {
          if (!r.ok) throw new Error("fetch failed");
          return r.json();
        })
        .catch(() => [] as Book[]);
    }
    return cache;
  }

  return fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error("fetch failed");
      return r.json();
    })
    .catch(() => [] as Book[]);
}

export function clearBooksCache() {
  cache = null;
}

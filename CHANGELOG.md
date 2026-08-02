# Changelog

Catatan update terakhir yang dilakukan di website ini. Baru paling atas = paling baru.

Format: `YYYY-MM-DD` — ringkasan singkat

## ⚠️ PENDING — BELUM COMMIT/PUSH/DEPLOY (kerjakan saat sesi lanjut)
**Bug:** Admin Buku → Berbayar → Edit → crash "This page couldn't load".

**Status:** FIX SUDAH DIBUAT DI FILE LOKAL, TAPI BELUM DI-COMMIT/PUSH/DEPLOY.

**Akar masalah:**
- `loadVolumes` di `src/components/admin/BookFormModal.tsx` panggil `/api/books?id=...&include_volumes=true` **tanpa** `admin=true`
- Commit `e5cfef3` (anti-bocor PDF berbayar) membuat API menyembunyikan `file_url` untuk buku berbayar → `v.file_url` jadi `undefined` → `v.file_url.trim()` di render modal → TypeError → crash
- Hanya buku berbayar yang kena (buku gratis `file_url` tetap string)

**Perubahan yang sudah dibuat (4 edit di `BookFormModal.tsx`):**
1. `:92` fetch volumes → tambah `&admin=true` (token admin sudah dikirim via header)
2. `:96` `file_url: v.file_url || ""`
3. `:198` submit → `(v.file_url || "").trim()`
4. `:340` render → `(v.file_url || "").trim()`

**Langkah yang harus dikerjakan:**
1. `git add src/components/admin/BookFormModal.tsx CHANGELOG.md`
2. `git commit -m "fix: edit buku berbayar di admin crash (file_url undefined di loadVolumes)"`
3. `git push`
4. Deploy (mis. `vercel --prod` / trigger auto-deploy)
5. Verifikasi di `https://pustaka.manhajsalafinsights.com/admin` → Buku → Berbayar → Edit
6. (Opsional) Jalankan `npx tsc --noEmit` sebelum push
7. Setelah sukses & terverifikasi: update/rapikan entry PENDING ini

**⚠️ JANGAN di-stage:** `src/app/api/pdf-proxy/route.ts` (perubahan lama tak terkait), `cdp-driver.mjs`, `inspect-tmp.mjs`, `test-q.mjs` (file debug)

## 2026-08-02
- Fix: admin Buku → Berbayar → Edit crash "This page couldn't load"
  - Akar: `loadVolumes` panggil `/api/books?id=...` tanpa `admin=true`, sehingga untuk buku berbayar `file_url` disembunyikan (undefined) → `v.file_url.trim()` di modal melempar TypeError
  - Fix: tambah `&admin=true` di fetch volumes (token admin via header sudah ada) + null-safety `(v.file_url || "").trim()` di render & submit modal

## 2026-07-31
- Fix: hentikan kebocoran PDF berbayar + bersihkan katalog rusak (`e5cfef3`)
- Fix: perbaiki pdf worker react-pdf 10 (pdfjs-dist 5.4.296) via `public/pdf.worker.min.mjs`
- Feat: tambah fitur buku unggulan (spotlight) hanya untuk 1 buku
- Fix: sort segera launching books by scheduled_at ascending
- Fix: add error boundary, not-found, dan null-safety untuk halaman detail buku
- Reorder: pindahkan section Segera Launching ke bawah Ebook Premium
- Fix: sanitize scheduled_at dan promo_price di PUT /api/books
- Fix: pindahkan Ebook Premium section lebih atas di homepage
- Perf: ringankan klik kartu — loading.tsx, lazy react-pdf, tidak fetch semua buku
- Fix: tinggi kartu konsisten dengan min-h + flex-col mt-auto
- Fix: tombol admin tidak bisa diklik karena middleware redirect
- Fix: admin dashboard tidak bisa diakses setelah refresh tab (sessionStorage vs cookie)
- Fix: admin dashboard — status filter, auth, randomize, error handling & middleware
- Mobile: scroll & 10 item di layar kecil, grid 2 kolom di lg-
- Buku Berdasarkan Kategori: 14 item

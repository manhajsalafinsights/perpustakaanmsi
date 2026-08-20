-- ALTER TABLE books ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ; 

-- ============================================
-- RATING KOMENTAR (2026-08-20): Fitur bintang
-- ============================================
-- ALTER TABLE comments ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;

-- ============================================
-- DONASI (2026-08-20): Dukung Penulis
-- ============================================
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS donations INTEGER DEFAULT 0; 

-- ============================================
-- Catatan Penting: Tabel Admins
-- ============================================
-- Jalankan SQL berikut di Supabase SQL Editor:

-- ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super BOOLEAN DEFAULT false;

-- UPDATE admins SET is_super = true WHERE email = 'yulianto90an@gmail.com';

-- ============================================
-- AUTH MIGRATION (2026-06-21): Hash passwords + token column
-- ============================================
-- ALTER TABLE admins ADD COLUMN IF NOT EXISTS token TEXT;
-- UPDATE admins SET password = encode(sha256(password::bytea), 'hex') WHERE password !~ '^[a-f0-9]{64}$';

-- INSERT INTO admins (name, email, password, is_super)
-- SELECT 'Super Admin', 'yulianto90an@gmail.com', '15070712Yuli@', true
-- WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'yulianto90an@gmail.com');

-- ============================================
-- DATABASE SCHEMA: Perpustakaan Digital MSI
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- Tabel Buku
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'Umum',
  author VARCHAR(255) DEFAULT '',
  views INTEGER DEFAULT 0,
  purchased INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  price INTEGER DEFAULT 25000,
  promo_price INTEGER,
  promo_text TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hanya 1 buku yang boleh menjadi unggulan (spotlight) pada satu waktu
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_one_featured ON books ((is_featured)) WHERE is_featured;

-- Tabel Jilid Buku (1 buku memiliki banyak jilid)
CREATE TABLE IF NOT EXISTS book_volumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT '',
  file_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_volumes_book_id ON book_volumes (book_id);

-- Tabel Pengunjung
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_category ON books (category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books (created_at DESC);

-- Enable trgm extension untuk pencarian fuzzy (opsional, untuk fitur pencarian yang lebih baik)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Aktifkan RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa membaca buku
CREATE POLICY "Public can read books" ON books
  FOR SELECT USING (true);

-- Policy: Semua orang bisa membaca jilid buku
CREATE POLICY "Public can read book_volumes" ON book_volumes
  FOR SELECT USING (true);

-- Policy: Semua orang bisa menambah pengunjung
CREATE POLICY "Public can insert visitors" ON visitors
  FOR INSERT WITH CHECK (true);

-- Policy: Semua orang bisa menghitung pengunjung
CREATE POLICY "Public can read visitors" ON visitors
  FOR SELECT USING (true);

-- ============================================
-- Tabel Rekomendasi Ebook (dari user)
-- ============================================
CREATE TABLE IF NOT EXISTS book_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert book_recommendations" ON book_recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read book_recommendations" ON book_recommendations
  FOR SELECT USING (true);

-- MIGRATION: Tambah kolom is_featured (buku unggulan / spotlight)
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_books_one_featured ON books ((is_featured)) WHERE is_featured;

-- ============================================
-- MIGRATION: Tambah kolom translator
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS translator VARCHAR(255) DEFAULT '';

-- MIGRATION: Tambah kolom views & purchased
-- Jalankan SQL berikut di Supabase SQL Editor:
-- ============================================
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS purchased INTEGER DEFAULT 0;
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 25000;
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS promo_price INTEGER;
-- ALTER TABLE books ADD COLUMN IF NOT EXISTS promo_text TEXT DEFAULT '';
-- ============================================
-- 1. Untuk akses admin (POST, PUT, DELETE pada tabel books),
--    ada dua opsi:
--
--    Opsi A: Gunakan service_role key di server-side (disarankan)
--    - Buat variabel SUPABASE_SERVICE_ROLE_KEY di .env.local
--    - Update supabase client di server components
--
--    Opsi B: Buat policy khusus dengan anon key
--    - Tambahkan policy di bawah ini:
--
-- CREATE POLICY "Anyone can manage books" ON books
--   FOR ALL USING (true) WITH CHECK (true);
--
-- 2. Jika menggunakan service_role key, update lib/supabase.ts:
--    - Buat client terpisah untuk server-side operations

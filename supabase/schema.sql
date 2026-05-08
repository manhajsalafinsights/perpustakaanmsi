-- ============================================
-- Catatan Penting: Tabel Admins
-- ============================================
-- Jalankan SQL berikut di Supabase SQL Editor:

-- ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super BOOLEAN DEFAULT false;

-- UPDATE admins SET is_super = true WHERE email = 'yulianto90an@gmail.com';

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa membaca buku
CREATE POLICY "Public can read books" ON books
  FOR SELECT USING (true);

-- Policy: Semua orang bisa menambah pengunjung
CREATE POLICY "Public can insert visitors" ON visitors
  FOR INSERT WITH CHECK (true);

-- Policy: Semua orang bisa menghitung pengunjung
CREATE POLICY "Public can read visitors" ON visitors
  FOR SELECT USING (true);

-- ============================================
-- CATATAN PENTING
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

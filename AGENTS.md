<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cybersecurity Hardening (2026-06-21)
- **Shared auth helper**: `lib/auth.ts` — `verifyAdmin()` + `hashPassword()` (SHA-256) + `generateToken()` (crypto.randomBytes)
- **Login API fix**: hash password before compare, secure random token instead of reversible base64, token disimpan di DB
- **Auth added**: 8 API routes — POST/PUT/DELETE books, DELETE comments, POST upload, GET migrate, POST admins, GET/DELETE auth
- **Admin FE**: konsisten pakai `Authorization: Bearer` header via `getHeaders()` helper
- **Middleware**: `src/middleware.ts` — proteksi server-side `/admin` via cookie
- **Cookie auth**: login set cookie `admin_token` (max-age 86400), logout hapus cookie
- **Password**: semua admin baru otomatis di-hash SHA-256
- **Schema**: `token` column + hash migration di `schema.sql`
- **TypeScript check**: `tsc --noEmit` exit 0 ✅

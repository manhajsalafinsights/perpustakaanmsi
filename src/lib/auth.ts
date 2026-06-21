import { createHash, randomBytes } from 'crypto';
import { createServiceClient } from './supabase';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function verifyAdmin(request: Request) {
  const auth = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const svc = createServiceClient();
  const { data } = await svc
    .from('admins')
    .select('id, name, email, is_super')
    .eq('token', auth)
    .single();
  return data;
}

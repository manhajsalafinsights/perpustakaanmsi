import { createHash, randomBytes } from 'crypto';
import { supabase } from './supabase';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function verifyAdmin(request: Request) {
  const auth = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const { data } = await supabase
    .from('admins')
    .select('id, name, email, is_super')
    .eq('token', auth)
    .single();
  return data;
}

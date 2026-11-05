import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efvchaahbshqjlmlrzta.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey !== 'sua_anon_key_aqui');

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-key'
);

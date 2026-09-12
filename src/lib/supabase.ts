/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { makeSafeSupabaseClient } from './supabase-safe';

const DEFAULT_SUPABASE_URL = 'https://bqzcgwpyjanuvaqivpeo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_PJY02yK96tsrbpINNdAQoA_w_7CMN8Q';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && !rawUrl.includes('wdaqfxmgonkbstqxhcns') && !rawUrl.includes('placeholder'))
  ? rawUrl
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (rawKey && !rawKey.includes('u1nCrJDLp5yUbbNTR89WGA') && !rawKey.includes('placeholder'))
  ? rawKey
  : DEFAULT_SUPABASE_ANON_KEY;

let rawSupabase: any;
try {
  rawSupabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.warn("Gagal inisialisasi Supabase client di frontend, beralih ke klien tiruan aman:", e);
  rawSupabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => ({ 
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        single: () => Promise.resolve({ data: null, error: null }) 
      }),
    })
  };
}

export const supabase = makeSafeSupabaseClient(rawSupabase);


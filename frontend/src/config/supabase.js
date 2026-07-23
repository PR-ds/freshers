import { createClient } from '@supabase/supabase-js';

// Setup Supabase browser connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const isMockClient = !import.meta.env.VITE_SUPABASE_URL;

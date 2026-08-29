import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Review = {
  id: string;
  name: string;
  game: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  created_at: string;
};

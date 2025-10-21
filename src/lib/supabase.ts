import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type LostItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'Electronics' | 'Books' | 'ID Cards' | 'Clothing' | 'Others';
  lost_date: string;
  location: string;
  contact_info: string;
  image_url: string | null;
  status: 'lost' | 'found' | 'closed';
  created_at: string;
  updated_at: string;
};

export type FoundItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'Electronics' | 'Books' | 'ID Cards' | 'Clothing' | 'Others';
  found_date: string;
  location: string;
  contact_info: string;
  image_url: string | null;
  status: 'available' | 'returned' | 'closed';
  created_at: string;
  updated_at: string;
};

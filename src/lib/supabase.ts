'use client';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mnsbcqmpprlfjlhpofmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJ...';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const makeUser = (sessionUser: any) => {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    full_name: sessionUser.user_metadata?.full_name || 'Investor',
    avatar_url: sessionUser.user_metadata?.avatar_url || null,
  };
};

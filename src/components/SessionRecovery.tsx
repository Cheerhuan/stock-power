'use client';
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function SessionRecovery() {
  useEffect(() => {
    const restore = async () => {
      // Handle PKCE code exchange
      const hasCode = new URLSearchParams(window.location.search).has('code');
      if (hasCode) {
        const { data } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (data?.session) {
          window.dispatchEvent(new CustomEvent('supabase-auth-change', { detail: { user: data.session.user } }));
        }
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          window.dispatchEvent(new CustomEvent('supabase-auth-change', { detail: { user: data.session.user } }));
        }
      }
    };
    restore();
  }, []);

  return null;
}

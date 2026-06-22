'use client';
import React, { useState, useEffect } from 'react';
import { Search, Settings, LogOut, User, Star } from 'lucide-react';
import { supabase, makeUser } from '@/lib/supabase';

interface Stock {
  id: string;
  name: string;
  price: string;
  change: number;
  grade: string;
}

export default function Sidebar({ activeStock, onSelectStock }: { activeStock: string, onSelectStock: (id: string) => void }) {
  const [user, setUser] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<string[]>(['2330', '2317', '2454']);

  useEffect(() => {
    // Sync auth state
    const syncUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(makeUser(data?.session?.user));
    };
    
    syncUser();
    const handleAuthChange = (e: any) => setUser(makeUser(e.detail.user));
    window.addEventListener('supabase-auth-change', handleAuthChange);
    
    return () => window.removeEventListener('supabase-auth-change', handleAuthChange);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.dispatchEvent(new CustomEvent('supabase-auth-change', { detail: { user: null } }));
  };

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-xs text-white">SP</div>
          <span className="font-semibold tracking-tight text-zinc-100">STOCK POWER</span>
        </div>
        
        <div 
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors group"
        >
          <Search size={14} />
          <span className="text-xs">Search Stocks...</span>
          <kbd className="ml-auto text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 group-hover:border-zinc-600">⌘K</kbd>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">My Watchlist</div>
        {watchlist.map(id => (
          <button 
            key={id}
            onClick={() => onSelectStock(id)}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-left ${activeStock === id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
          >
            <span className="text-sm font-medium">{id}</span>
            <Star size={12} className={activeStock === id ? 'text-indigo-400 fill-indigo-400' : 'text-zinc-600'} />
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800">
        {user ? (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-zinc-200 truncate">{user.full_name}</span>
                <span className="text-[10px] text-zinc-500 truncate">{user.email}</span>
              </div>
            </div>
            <button onClick={handleSignOut} className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
            className="w-full py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-all"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}

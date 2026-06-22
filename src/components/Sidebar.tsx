'use client';
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart4, Bookmark, Bell, LogOut, Command, ChevronRight } from 'lucide-react';
import { supabase, makeUser } from '@/lib/supabase';

export default function Sidebar({ stockData, activeView, setActiveView, activeStock, onSelectStock }: any) {
  const [user, setUser] = useState<any>(null);
  const watchlist = ['2330','2317','2454','2382','2376','3443'];

  useEffect(() => {
    const sync = async () => { const { data: { session } } = await supabase.auth.getSession(); setUser(makeUser(session?.user)); };
    sync();
    const h = (e: any) => setUser(makeUser(e.detail.user));
    window.addEventListener('supabase-auth-change', h);
    return () => window.removeEventListener('supabase-auth-change', h);
  }, []);

  const nav = [
    { id: 'market', label: 'Market', sub: '大盤即時', icon: TrendingUp },
    { id: 'watchlist', label: 'Watchlist', sub: '自選監控', icon: Bookmark },
    { id: 'screener', label: 'Screener', sub: '智慧選股', icon: BarChart4 },
  ];

  return (
    <aside className="w-[72px] lg:w-[220px] shrink-0 h-screen sticky top-0 flex flex-col z-10">
      {/* Ambient bar background */}
      <div className="absolute inset-0 rounded-r-2xl glass" />
      
      <div className="relative z-10 flex flex-col h-full px-3 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6 px-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-xs font-black text-white">AI</span>
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-bold text-white tracking-tight">Stock Power</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ai-pulse" />
              <span className="text-[9px] text-zinc-500 font-medium">AI ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 cursor-pointer hover:border-zinc-700/50 transition-all group mb-5">
          <Search size={14} className="text-zinc-500 group-hover:text-zinc-300" />
          <span className="hidden lg:block text-xs text-zinc-500 flex-1">搜尋股票...</span>
          <kbd className="hidden lg:flex text-[9px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700 items-center gap-0.5"><Command size={9} />K</kbd>
        </div>

        {/* Nav */}
        <div className="space-y-1 mb-6">
          {nav.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button key={item.id} onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent'
                }`}>
                <Icon size={16} className={isActive ? 'text-indigo-400' : ''} />
                <div className="hidden lg:block text-left">
                  <div className={`text-xs font-semibold ${isActive ? 'text-indigo-200' : 'text-zinc-300'}`}>{item.label}</div>
                  <div className="text-[9px] text-zinc-600">{item.sub}</div>
                </div>
                {isActive && <ChevronRight size={12} className="hidden lg:block ml-auto text-indigo-400" />}
              </button>
            );
          })}
        </div>

        {/* Watchlist */}
        <div className="hidden lg:block flex-1 overflow-y-auto">
          <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.15em] mb-2 px-3">Watchlist</div>
          <div className="space-y-0.5">
            {watchlist.map(id => {
              const s = stockData?.[id];
              return (
                <button key={id} onClick={() => { onSelectStock(id); setActiveView('detail'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    activeStock === id && activeView === 'detail' ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-300">{id}</span>
                    <span className="text-[10px] text-zinc-600">{s?.name}</span>
                  </div>
                  {s && (
                    <span className={`text-[10px] font-mono font-bold ${s.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {s.change > 0 ? '+' : ''}{s.change}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div className="mt-auto pt-3 border-t border-zinc-800/30">
          {user ? (
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">
                {user.full_name?.[0] || 'U'}
              </div>
              <div className="hidden lg:block flex-1 min-w-0">
                <div className="text-[10px] font-medium text-zinc-400 truncate">{user.full_name}</div>
              </div>
              <button onClick={async () => { await supabase.auth.signOut(); window.dispatchEvent(new CustomEvent('supabase-auth-change', {detail:{user:null}})); }}
                className="p-1 text-zinc-600 hover:text-rose-400 transition-colors flex-shrink-0"><LogOut size={12} /></button>
            </div>
          ) : (
            <button onClick={() => supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}})}
              className="w-full py-2 bg-white/10 hover:bg-white/15 text-white text-[10px] font-semibold rounded-xl transition-all border border-white/10">
              <span className="hidden lg:inline">Sign in</span>
              <span className="lg:hidden">→</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

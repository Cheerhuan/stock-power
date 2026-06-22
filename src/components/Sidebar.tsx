'use client';
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, BarChart4, Bookmark, Bell, MoreHorizontal, LogOut, Star } from 'lucide-react';
import { supabase, makeUser } from '@/lib/supabase';

interface SidebarProps {
  stockData: Record<string, any>;
  activeView: string;
  setActiveView: (v: string) => void;
  activeStock: string;
  onSelectStock: (id: string) => void;
}

export default function Sidebar({ stockData, activeView, setActiveView, activeStock, onSelectStock }: SidebarProps) {
  const [user, setUser] = useState<any>(null);
  const watchlist = ['2330','2317','2454','2382','2376','3443'];

  useEffect(() => {
    const syncUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(makeUser(session?.user));
    };
    syncUser();
    const h = (e: any) => setUser(makeUser(e.detail.user));
    window.addEventListener('supabase-auth-change', h);
    return () => window.removeEventListener('supabase-auth-change', h);
  }, []);

  const nav = [
    { id: 'market', label: '大盤概覽', icon: TrendingUp },
    { id: 'watchlist', label: '自選股', icon: Bookmark },
    { id: 'screener', label: '選股', icon: BarChart4 },
    { id: 'alerts', label: '提醒', icon: Bell },
  ];

  const concepts = ['AI 概念股','半導體','蘋概股','金控','傳產','伺服器'];

  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-zinc-950/95 border-r border-zinc-800 flex flex-col backdrop-blur-xl">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-lg">SP</div>
          <span className="font-bold tracking-tight text-white text-sm">Stock Power</span>
        </div>
        <div onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-500 cursor-pointer hover:text-zinc-300 hover:border-zinc-700 transition-all group">
          <Search size={14} />
          <span className="text-xs">搜尋股票...</span>
          <kbd className="ml-auto text-[10px] bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700">⌘K</kbd>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-3 border-b border-zinc-800/50">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-2">功能</div>
        {nav.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all mb-0.5 ${
                activeView === item.id ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}>
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </div>

      {/* 類股/概念 */}
      <div className="p-3 border-b border-zinc-800/50 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 px-2">熱門概念</div>
        {concepts.map(c => {
          const chg = stockData?._concepts?.[c];
          return (
            <button key={c} className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all">
              <span>{c}</span>
              {chg !== undefined && (
                <span className={chg > 0 ? 'text-emerald-500' : 'text-rose-500'}>{chg > 0 ? '+' : ''}{chg}%</span>
              )}
            </button>
          );
        })}
      </div>

      {/* User */}
      <div className="p-3 border-t border-zinc-800/50">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">{user.full_name?.[0] || 'U'}</div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-zinc-300">{user.full_name}</span>
                <span className="text-[10px] text-zinc-600">{user.email}</span>
              </div>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); window.dispatchEvent(new CustomEvent('supabase-auth-change', {detail:{user:null}})); }}
              className="p-1.5 text-zinc-600 hover:text-rose-400 transition-colors"><LogOut size={14} /></button>
          </div>
        ) : (
          <button onClick={() => supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}})}
            className="w-full py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg">
            Google 登入
          </button>
        )}
      </div>
    </aside>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  stockData: Record<string, any>;
}

export default function CommandPalette({ isOpen, onClose, onSelect, stockData }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const stocks = Object.values(stockData || {}).filter((s: any) => s?.id && s?.name);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); window.dispatchEvent(new CustomEvent('open-command-palette')); }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => { setQuery(''); }, [isOpen]);

  if (!isOpen) return null;

  const filtered = query.length > 0
    ? stocks.filter((s: any) => s.id.includes(query) || s.name.includes(query))
    : stocks;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center p-4 border-b border-zinc-800 gap-3">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input autoFocus className="flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-500 text-sm" placeholder="輸入代號或名稱搜尋..." value={query} onChange={e => setQuery(e.target.value)} />
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500"><X size={16} /></button>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length > 0 ? filtered.slice(0, 15).map((s: any) => (
            <button key={s.id} onClick={() => { onSelect(s.id); onClose(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-zinc-200">{s.id}</span>
                  <span className="text-xs text-zinc-500">{s.name}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  s.grade?.startsWith('A') ? 'bg-emerald-500/10 text-emerald-400' :
                  s.grade === 'D' ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-500/10 text-zinc-400'
                }`}>{s.grade || '-'}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-zinc-300">{s.price?.toLocaleString()}</span>
                <span className={s.change > 0 ? 'text-emerald-500 text-xs' : 'text-rose-500 text-xs'}>{s.change > 0 ? '+' : ''}{s.change}%</span>
              </div>
            </button>
          )) : (
            <div className="p-8 text-center text-zinc-600 text-sm">找不到相符的股票</div>
          )}
        </div>
      </div>
    </div>
  );
}
